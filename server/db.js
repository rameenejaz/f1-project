import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function buildPoolConfig() {
  const socketPath = process.env.DB_SOCKET?.trim();
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME || 'f1_dashboard';
  const base = {
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
  };

  if (socketPath) {
    return { ...base, socketPath };
  }

  const host = process.env.DB_HOST || '127.0.0.1';
  const rawPort = process.env.DB_PORT;
  const out = { ...base, host };
  if (rawPort != null && String(rawPort).trim() !== '') {
    const n = Number(rawPort);
    if (Number.isFinite(n) && n > 0) out.port = n;
  }
  return out;
}

const poolConfig = buildPoolConfig();
if (poolConfig.socketPath) {
  console.log(`[db] MySQL via socket ${poolConfig.socketPath}`);
} else {
  const p = 'port' in poolConfig && poolConfig.port != null ? poolConfig.port : 3306;
  console.log(`[db] MySQL via TCP ${poolConfig.host}:${p}`);
}

const pwdSet = process.env.DB_PASSWORD != null && String(process.env.DB_PASSWORD).length > 0;
if (!poolConfig.socketPath && !pwdSet) {
  console.warn(
    '[db] DB_PASSWORD is empty. Official MySQL Docker images require MYSQL_ROOT_PASSWORD — set DB_PASSWORD in server/.env to match it (host shows as 192.168.65.1 from Docker Desktop).'
  );
}

export const pool = mysql.createPool(poolConfig);

/** @param {string} sql @param {unknown[]} [params] */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

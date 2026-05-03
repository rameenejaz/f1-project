/**
 * Applies server/schema.sql using credentials from server/.env
 * (creates database f1_dashboard, tables, seed data).
 * Run from server/: npm run db:apply
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(serverRoot, '.env') });

const sqlPath = path.join(serverRoot, 'schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD ?? '';

if (!password) {
  console.error('DB_PASSWORD is empty in server/.env — set it to your MySQL root password.');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host,
  port,
  user,
  password,
  multipleStatements: true,
});

try {
  await conn.query(sql);
  console.log(`Applied ${path.basename(sqlPath)} to ${host}:${port} (database f1_dashboard).`);
} finally {
  await conn.end();
}

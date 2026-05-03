import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5051;

app.use(cors({ origin: true }));
app.use(express.json());

function first(rows) {
  if (rows == null) return null;
  return Array.isArray(rows) ? rows[0] ?? null : rows;
}

function mapTeam(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    color: row.color_hex,
    founded_year: row.founded_year,
  };
}

function mapDriver(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.full_name,
    team_id: row.team_id,
    team: row.team_name,
    color: row.team_color,
    nationality: row.nationality,
    start_year: row.f1_debut_year,
    performance_score: row.performance_index,
    description: row.description ?? '',
    total_wins: row.total_wins != null ? Number(row.total_wins) : 0,
  };
}

function mapSeason(row) {
  if (!row) return row;
  return {
    id: row.id,
    year: row.year,
    champion_driver_id: row.champion_driver_id,
    champion_team_id: row.champion_team_id,
    champion_driver_name: row.champion_driver_name ?? null,
    champion_team_name: row.champion_team_name ?? null,
    champion_team_color: row.champion_team_color ?? null,
    race_count: row.race_count != null ? Number(row.race_count) : 0,
  };
}

function mapRace(row) {
  if (!row) return row;
  return {
    id: row.id,
    season_id: row.season_id,
    season_year: row.season_year != null ? Number(row.season_year) : null,
    race_name: row.race_name,
    race_date: row.race_date,
    winner_driver_id: row.winner_driver_id,
    winner_name: row.winner_name ?? null,
  };
}

/** @param {unknown} id */
function badId(id) {
  const n = Number(id);
  return !Number.isInteger(n) || n < 1;
}

const isProd = process.env.NODE_ENV === 'production';

/** @param {import('express').Response} res @param {string} message @param {unknown} e */
function sendDbError(res, message, e) {
  console.error(e);
  const body = { error: message };
  if (!isProd && e) {
    const detail =
      typeof e === 'object' && e !== null && 'sqlMessage' in e && e.sqlMessage
        ? String(e.sqlMessage)
        : e instanceof Error
          ? e.message
          : undefined;
    if (detail) body.detail = detail;
  }
  res.status(500).json(body);
}

const seasonSelectJoin = `
  SELECT s.id, s.year, s.champion_driver_id, s.champion_team_id,
         d.full_name AS champion_driver_name,
         t.name AS champion_team_name,
         t.color_hex AS champion_team_color,
         (SELECT COUNT(*) FROM races r WHERE r.season_id = s.id) AS race_count
  FROM seasons s
  LEFT JOIN drivers d ON d.id = s.champion_driver_id
  LEFT JOIN teams t ON t.id = s.champion_team_id
`;

// ——— Teams ———

app.get('/teams', async (_req, res) => {
  try {
    const rows = await query(`SELECT id, name, color_hex, founded_year FROM teams ORDER BY name`);
    res.json((Array.isArray(rows) ? rows : []).map(mapTeam));
  } catch (e) {
    sendDbError(res, 'Failed to load teams', e);
  }
});

app.get('/teams/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const rows = await query(`SELECT id, name, color_hex, founded_year FROM teams WHERE id = ?`, [
      req.params.id,
    ]);
    const row = first(rows);
    if (!row) return res.status(404).json({ error: 'Team not found' });
    res.json(mapTeam(row));
  } catch (e) {
    sendDbError(res, 'Failed to load team', e);
  }
});

app.post('/teams', async (req, res) => {
  try {
    const { name, color, founded_year } = req.body;
    if (!name || !color || founded_year == null) {
      return res.status(400).json({ error: 'name, color, and founded_year are required' });
    }
    const ins = await query(`INSERT INTO teams (name, color_hex, founded_year) VALUES (?, ?, ?)`, [
      name,
      color,
      Number(founded_year),
    ]);
    const insertId = ins.insertId;
    const createdRows = await query(`SELECT id, name, color_hex, founded_year FROM teams WHERE id = ?`, [
      insertId,
    ]);
    const created = first(createdRows);
    res.status(201).json(mapTeam(created));
  } catch (e) {
    sendDbError(res, 'Failed to create team', e);
  }
});

app.put('/teams/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const rows = await query(`SELECT * FROM teams WHERE id = ?`, [id]);
    const cur = first(rows);
    if (!cur) return res.status(404).json({ error: 'Team not found' });
    const b = req.body;
    const name = b.name ?? cur.name;
    const color_hex = b.color ?? cur.color_hex;
    const founded_year = b.founded_year != null ? Number(b.founded_year) : cur.founded_year;
    await query(`UPDATE teams SET name = ?, color_hex = ?, founded_year = ? WHERE id = ?`, [
      name,
      color_hex,
      founded_year,
      id,
    ]);
    const out = await query(`SELECT id, name, color_hex, founded_year FROM teams WHERE id = ?`, [id]);
    res.json(mapTeam(first(out)));
  } catch (e) {
    sendDbError(res, 'Failed to update team', e);
  }
});

app.delete('/teams/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const del = await query(`DELETE FROM teams WHERE id = ?`, [id]);
    const affected = del?.affectedRows ?? 0;
    if (affected === 0) return res.status(404).json({ error: 'Team not found' });
    res.status(204).send();
  } catch (e) {
    sendDbError(res, 'Failed to delete team', e);
  }
});

const driverJoinSelect = `
  SELECT d.id, d.team_id, d.full_name, d.nationality, d.f1_debut_year, d.performance_index,
         d.description, d.total_wins,
         t.name AS team_name, t.color_hex AS team_color
  FROM drivers d
  JOIN teams t ON t.id = d.team_id
`;

// ——— Drivers ———

app.get('/drivers', async (req, res) => {
  try {
    const teamId = req.query.team_id;
    const sql = `${driverJoinSelect} ${teamId ? 'WHERE d.team_id = ?' : ''} ORDER BY d.full_name ASC`;
    const rows = teamId ? await query(sql, [teamId]) : await query(sql);
    res.json((Array.isArray(rows) ? rows : []).map(mapDriver));
  } catch (e) {
    sendDbError(res, 'Failed to load drivers', e);
  }
});

app.get('/drivers/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const rows = await query(`${driverJoinSelect} WHERE d.id = ?`, [req.params.id]);
    const row = first(rows);
    if (!row) return res.status(404).json({ error: 'Driver not found' });
    const winsRows = await query(
      `SELECT r.id, r.race_name, r.race_date, s.year AS season_year
       FROM races r
       JOIN seasons s ON s.id = r.season_id
       WHERE r.winner_driver_id = ?
       ORDER BY r.race_date DESC`,
      [req.params.id]
    );
    const races_won = (Array.isArray(winsRows) ? winsRows : []).map((r) => ({
      id: r.id,
      race_name: r.race_name,
      race_date: r.race_date,
      season_year: r.season_year,
    }));
    res.json({ ...mapDriver(row), races_won });
  } catch (e) {
    sendDbError(res, 'Failed to load driver', e);
  }
});

app.post('/drivers', async (req, res) => {
  try {
    const { name, team_id, nationality, start_year, performance_score, description, total_wins } = req.body;
    if (!name || team_id == null || !nationality || start_year == null || performance_score == null) {
      return res.status(400).json({
        error: 'name, team_id, nationality, start_year, and performance_score are required',
      });
    }
    const wins = total_wins != null ? Math.max(0, Number(total_wins)) : 0;
    const ins = await query(
      `INSERT INTO drivers (team_id, full_name, nationality, f1_debut_year, performance_index, description, total_wins)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(team_id),
        name,
        nationality,
        Number(start_year),
        Number(performance_score),
        description ?? null,
        wins,
      ]
    );
    const insertId = ins.insertId;
    const createdRows = await query(`${driverJoinSelect} WHERE d.id = ?`, [insertId]);
    const created = first(createdRows);
    res.status(201).json(mapDriver(created));
  } catch (e) {
    sendDbError(res, 'Failed to create driver', e);
  }
});

app.put('/drivers/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const rows = await query(`SELECT d.* FROM drivers d WHERE d.id = ?`, [id]);
    const cur = first(rows);
    if (!cur) return res.status(404).json({ error: 'Driver not found' });
    const b = req.body;
    const team_id = b.team_id != null ? Number(b.team_id) : cur.team_id;
    const full_name = b.name ?? cur.full_name;
    const nationality = b.nationality ?? cur.nationality;
    const f1_debut_year = b.start_year != null ? Number(b.start_year) : cur.f1_debut_year;
    const performance_index =
      b.performance_score != null ? Number(b.performance_score) : cur.performance_index;
    const desc = b.description !== undefined ? b.description : cur.description;
    const total_wins = b.total_wins != null ? Math.max(0, Number(b.total_wins)) : cur.total_wins;
    await query(
      `UPDATE drivers SET team_id=?, full_name=?, nationality=?, f1_debut_year=?, performance_index=?,
       description=?, total_wins=? WHERE id=?`,
      [team_id, full_name, nationality, f1_debut_year, performance_index, desc, total_wins, id]
    );
    const out = await query(`${driverJoinSelect} WHERE d.id = ?`, [id]);
    res.json(mapDriver(first(out)));
  } catch (e) {
    sendDbError(res, 'Failed to update driver', e);
  }
});

app.delete('/drivers/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const del = await query(`DELETE FROM drivers WHERE id = ?`, [id]);
    const affected = del?.affectedRows ?? 0;
    if (affected === 0) return res.status(404).json({ error: 'Driver not found' });
    res.status(204).send();
  } catch (e) {
    sendDbError(res, 'Failed to delete driver', e);
  }
});

// ——— Seasons ———

app.get('/seasons', async (_req, res) => {
  try {
    const rows = await query(`${seasonSelectJoin} ORDER BY s.year DESC`);
    res.json((Array.isArray(rows) ? rows : []).map(mapSeason));
  } catch (e) {
    sendDbError(res, 'Failed to load seasons', e);
  }
});

app.get('/seasons/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const rows = await query(`${seasonSelectJoin} WHERE s.id = ?`, [req.params.id]);
    const row = first(rows);
    if (!row) return res.status(404).json({ error: 'Season not found' });
    res.json(mapSeason(row));
  } catch (e) {
    sendDbError(res, 'Failed to load season', e);
  }
});

app.post('/seasons', async (req, res) => {
  try {
    const { year, champion_driver_id, champion_team_id } = req.body;
    if (year == null) return res.status(400).json({ error: 'year is required' });
    const ins = await query(
      `INSERT INTO seasons (year, champion_driver_id, champion_team_id) VALUES (?, ?, ?)`,
      [Number(year), champion_driver_id ?? null, champion_team_id ?? null]
    );
    const insertId = ins.insertId;
    const out = await query(`${seasonSelectJoin} WHERE s.id = ?`, [insertId]);
    res.status(201).json(mapSeason(first(out)));
  } catch (e) {
    sendDbError(res, 'Failed to create season', e);
  }
});

app.put('/seasons/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const rows = await query(`SELECT * FROM seasons WHERE id = ?`, [id]);
    const cur = first(rows);
    if (!cur) return res.status(404).json({ error: 'Season not found' });
    const b = req.body;
    const year = b.year != null ? Number(b.year) : cur.year;
    const champion_driver_id =
      b.champion_driver_id !== undefined ? b.champion_driver_id : cur.champion_driver_id;
    const champion_team_id = b.champion_team_id !== undefined ? b.champion_team_id : cur.champion_team_id;
    await query(`UPDATE seasons SET year=?, champion_driver_id=?, champion_team_id=? WHERE id=?`, [
      year,
      champion_driver_id,
      champion_team_id,
      id,
    ]);
    const out = await query(`${seasonSelectJoin} WHERE s.id = ?`, [id]);
    res.json(mapSeason(first(out)));
  } catch (e) {
    sendDbError(res, 'Failed to update season', e);
  }
});

app.delete('/seasons/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const del = await query(`DELETE FROM seasons WHERE id = ?`, [id]);
    const affected = del?.affectedRows ?? 0;
    if (affected === 0) return res.status(404).json({ error: 'Season not found' });
    res.status(204).send();
  } catch (e) {
    sendDbError(res, 'Failed to delete season', e);
  }
});

// ——— Races ———

app.get('/races', async (req, res) => {
  try {
    const seasonId = req.query.season_id;
    let sql = `
      SELECT r.id, r.season_id, r.race_name, r.race_date, r.winner_driver_id,
             d.full_name AS winner_name, s.year AS season_year
      FROM races r
      JOIN seasons s ON s.id = r.season_id
      LEFT JOIN drivers d ON d.id = r.winner_driver_id
    `;
    const params = [];
    if (seasonId != null && String(seasonId).trim() !== '') {
      sql += ` WHERE r.season_id = ?`;
      params.push(Number(seasonId));
    }
    sql += ` ORDER BY r.race_date ASC`;
    const rows = params.length ? await query(sql, params) : await query(sql);
    res.json((Array.isArray(rows) ? rows : []).map(mapRace));
  } catch (e) {
    sendDbError(res, 'Failed to load races', e);
  }
});

app.get('/races/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const rows = await query(
      `SELECT r.id, r.season_id, r.race_name, r.race_date, r.winner_driver_id,
              d.full_name AS winner_name, s.year AS season_year
       FROM races r
       JOIN seasons s ON s.id = r.season_id
       LEFT JOIN drivers d ON d.id = r.winner_driver_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    const row = first(rows);
    if (!row) return res.status(404).json({ error: 'Race not found' });
    res.json(mapRace(row));
  } catch (e) {
    sendDbError(res, 'Failed to load race', e);
  }
});

app.post('/races', async (req, res) => {
  try {
    const { season_id, race_name, race_date, winner_driver_id } = req.body;
    if (!season_id || !race_name || !race_date) {
      return res.status(400).json({ error: 'season_id, race_name, and race_date are required' });
    }
    const ins = await query(
      `INSERT INTO races (season_id, race_name, race_date, winner_driver_id) VALUES (?, ?, ?, ?)`,
      [Number(season_id), race_name, race_date, winner_driver_id ?? null]
    );
    const insertId = ins.insertId;
    const out = await query(
      `SELECT r.id, r.season_id, r.race_name, r.race_date, r.winner_driver_id,
              d.full_name AS winner_name, s.year AS season_year
       FROM races r
       JOIN seasons s ON s.id = r.season_id
       LEFT JOIN drivers d ON d.id = r.winner_driver_id
       WHERE r.id = ?`,
      [insertId]
    );
    res.status(201).json(mapRace(first(out)));
  } catch (e) {
    sendDbError(res, 'Failed to create race', e);
  }
});

app.put('/races/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const rows = await query(`SELECT * FROM races WHERE id = ?`, [id]);
    const cur = first(rows);
    if (!cur) return res.status(404).json({ error: 'Race not found' });
    const b = req.body;
    const season_id = b.season_id != null ? Number(b.season_id) : cur.season_id;
    const race_name = b.race_name ?? cur.race_name;
    const race_date = b.race_date ?? cur.race_date;
    const winner_driver_id =
      b.winner_driver_id !== undefined ? b.winner_driver_id : cur.winner_driver_id;
    await query(
      `UPDATE races SET season_id=?, race_name=?, race_date=?, winner_driver_id=? WHERE id=?`,
      [season_id, race_name, race_date, winner_driver_id, id]
    );
    const out = await query(
      `SELECT r.id, r.season_id, r.race_name, r.race_date, r.winner_driver_id,
              d.full_name AS winner_name, s.year AS season_year
       FROM races r
       JOIN seasons s ON s.id = r.season_id
       LEFT JOIN drivers d ON d.id = r.winner_driver_id
       WHERE r.id = ?`,
      [id]
    );
    res.json(mapRace(first(out)));
  } catch (e) {
    sendDbError(res, 'Failed to update race', e);
  }
});

app.delete('/races/:id', async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const id = Number(req.params.id);
    const del = await query(`DELETE FROM races WHERE id = ?`, [id]);
    const affected = del?.affectedRows ?? 0;
    if (affected === 0) return res.status(404).json({ error: 'Race not found' });
    res.status(204).send();
  } catch (e) {
    sendDbError(res, 'Failed to delete race', e);
  }
});

// ——— Dashboard summary (distinct from analytics) ———

app.get('/stats/dashboard', async (req, res) => {
  try {
    const teamId = req.query.team_id != null && req.query.team_id !== '' ? Number(req.query.team_id) : null;

    const tc = first(await query(`SELECT COUNT(*) AS c FROM teams`));
    const dc = first(await query(`SELECT COUNT(*) AS c FROM drivers`));
    const rc = first(await query(`SELECT COUNT(*) AS c FROM races`));
    const sc = first(await query(`SELECT COUNT(*) AS c FROM seasons`));

    let teamSlice = null;
    if (teamId != null && !Number.isNaN(teamId)) {
      const trow = first(await query(`SELECT id, name, color_hex, founded_year FROM teams WHERE id = ?`, [teamId]));
      if (trow) {
        const agg = first(
          await query(
            `SELECT COUNT(*) AS drivers, COALESCE(SUM(total_wins),0) AS wins, ROUND(AVG(performance_index)) AS perf
             FROM drivers WHERE team_id = ?`,
            [teamId]
          )
        );
        teamSlice = {
          team: mapTeam(trow),
          driver_count: Number(agg?.drivers ?? 0),
          total_wins: Number(agg?.wins ?? 0),
          avg_performance: agg?.perf != null ? Number(agg.perf) : 0,
        };
      }
    }

    const recentRows = await query(
      `SELECT r.race_name, r.race_date, d.full_name AS winner_name, s.year AS season_year
       FROM races r
       JOIN seasons s ON s.id = r.season_id
       LEFT JOIN drivers d ON d.id = r.winner_driver_id
       ORDER BY r.race_date DESC
       LIMIT 6`
    );
    const recent_races = (Array.isArray(recentRows) ? recentRows : []).map((r) => ({
      race_name: r.race_name,
      race_date: r.race_date,
      winner_name: r.winner_name,
      season_year: r.season_year,
    }));

    res.json({
      totals: {
        teams: Number(tc?.c ?? 0),
        drivers: Number(dc?.c ?? 0),
        races: Number(rc?.c ?? 0),
        seasons: Number(sc?.c ?? 0),
      },
      team: teamSlice,
      recent_races,
    });
  } catch (e) {
    sendDbError(res, 'Failed to load dashboard stats', e);
  }
});

// ——— Analytics charts (races + drivers; not the same payload as dashboard) ———

app.get('/stats/analytics', async (_req, res) => {
  try {
    const racesRows = await query(
      `SELECT MONTH(race_date) AS m, DATE_FORMAT(race_date, '%b') AS month, COUNT(*) AS races
       FROM races GROUP BY MONTH(race_date), DATE_FORMAT(race_date, '%b')
       ORDER BY m ASC`
    );
    const racesPerMonth = (Array.isArray(racesRows) ? racesRows : []).map((r) => ({
      month: r.month,
      races: Number(r.races),
    }));

    const winsRows = await query(
      `SELECT d.id, d.full_name AS name, t.color_hex AS color, COUNT(r.id) AS wins
       FROM drivers d
       JOIN teams t ON t.id = d.team_id
       LEFT JOIN races r ON r.winner_driver_id = d.id
       GROUP BY d.id, d.full_name, t.color_hex
       ORDER BY wins DESC, d.full_name ASC`
    );
    const winsPerDriver = (Array.isArray(winsRows) ? winsRows : []).map((r) => ({
      name: r.name,
      wins: Number(r.wins),
      color: r.color,
    }));

    const trendRows = await query(
      `SELECT r.race_date, r.race_name AS label, d.performance_index AS score
       FROM races r
       INNER JOIN drivers d ON d.id = r.winner_driver_id
       ORDER BY r.race_date ASC`
    );
    const performanceTrend = (Array.isArray(trendRows) ? trendRows : []).map((r) => ({
      label: r.label,
      score: Number(r.score),
      date: r.race_date,
    }));

    res.json({ racesPerMonth, winsPerDriver, performanceTrend });
  } catch (e) {
    sendDbError(res, 'Failed to load analytics', e);
  }
});

const server = app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use. Either stop the other process or set PORT in server/.env to a free port (e.g. 5052).\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

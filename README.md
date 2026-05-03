# F1 Driver & Team Management Dashboard

Full-stack app: **React (Vite) + Tailwind + Recharts** frontend, **Express + MySQL** backend. All CRUD and charts use **live MySQL data** (no mock fallbacks in the API layer).

## Prerequisites

- Node.js 18+
- MySQL 8+

## 1. Database

`server/schema.sql` defines **teams**, **drivers**, **seasons**, and **races** with seed data. It **drops** existing tables in `f1_dashboard` — run when you want a clean slate:

```bash
mysql -u root -p < server/schema.sql
```

If MySQL is on another port (e.g. Docker **`3307:3306`**), add **`-P 3307`** to the `mysql` command.

**Easier (reads `server/.env`):** from the **`server/`** folder run:

```bash
npm run db:apply
```

That creates **`f1_dashboard`** and all tables if they are missing. Copy `server/.env.example` to `server/.env`, set **`DB_PORT`** when using Docker, and set **`DB_PASSWORD`** to match **`MYSQL_ROOT_PASSWORD`** (empty password causes `ER_ACCESS_DENIED_ERROR`).

## 2. API

```bash
cd server
npm install
npm run dev
```

Default: **http://localhost:5051**

| Area | Routes |
|------|--------|
| Teams | `GET/POST /teams`, `GET/PUT/DELETE /teams/:id` |
| Drivers | `GET/POST /drivers`, `GET/PUT/DELETE /drivers/:id` (`GET :id` includes `races_won`) |
| Seasons | `GET/POST /seasons`, `GET/PUT/DELETE /seasons/:id` (list includes champion joins + race count) |
| Races | `GET/POST /races`, `GET/PUT/DELETE /races/:id`, `GET /races?season_id=` |
| Dashboard | `GET /stats/dashboard?team_id=` — totals, team slice, recent races |
| Analytics | `GET /stats/analytics` — races/month, wins per driver, winner performance trend |

## 3. Client

```bash
cd client
npm install
cp .env.example .env   # optional: tune ports
npm run dev
```

Dev server defaults to **http://localhost:5175**. Vite proxies **`/teams`**, **`/drivers`**, **`/seasons`**, **`/races`**, and **`/stats`** to **`VITE_API_PROXY_TARGET`** (must match **`PORT`** in `server/.env`).

For production preview without the proxy, set **`VITE_API_URL`** to the API origin.

## Project layout

- `client/src/pages` — `Dashboard`, `Drivers`, `DriverDetail`, `Teams`, `Seasons`, `Analytics`, `Settings`, `Home`
- `client/src/layouts/MainLayout.jsx` — shell, team filter, `reload()` after mutations
- `client/src/api.js` — axios client (throws on HTTP errors; layout shows load failures)
- `server/schema.sql` — relational schema + seed
- `server/index.js` — REST + SQL JOINs

## Notes

- **Docker MySQL**: map host port (e.g. `3307:3306`) and set `DB_PORT=3307` in `server/.env`.
- `client/src/data/mockData.js` is only used for **dashboard action tiles** (static shortcuts), not for API results.

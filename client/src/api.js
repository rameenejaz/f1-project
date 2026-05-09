import axios from 'axios';

/** Empty string = same origin in dev → Vite proxy forwards to Express */
function resolveBaseURL() {
  const v = import.meta.env.VITE_API_URL;
  if (v != null && String(v).trim() !== '') return String(v).replace(/\/$/, '');
  return '';
}

const client = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 12000,
});

/** Human-readable message from a failed axios request (uses `error` + `detail` from API). */
export function formatAxiosError(err) {
  if (!axios.isAxiosError(err)) return err instanceof Error ? err.message : String(err);
  const d = err.response?.data;
  if (d && typeof d === 'object') {
    const parts = [d.error, d.detail].filter(Boolean);
    if (parts.length) return parts.join(': ');
  }
  return err.message || 'Request failed';
}

export async function fetchTeams() {
  const { data } = await client.get('/teams');
  return Array.isArray(data) ? data : [];
}

export async function fetchTeam(id) {
  const { data } = await client.get(`/teams/${id}`);
  return data;
}

export async function fetchDrivers(opts = {}) {
  const teamId = typeof opts === 'number' || typeof opts === 'string' ? opts : opts?.teamId ?? opts?.team_id;
  const sort = typeof opts === 'object' && opts && 'sort' in opts ? opts.sort : undefined;
  const order = typeof opts === 'object' && opts && 'order' in opts ? opts.order : undefined;
  const params = {};
  if (teamId != null && String(teamId).trim() !== '') params.team_id = teamId;
  if (sort) params.sort = sort;
  if (order) params.order = order;
  const { data } = await client.get('/drivers', { params: Object.keys(params).length ? params : undefined });
  return Array.isArray(data) ? data : [];
}

export async function fetchDriver(id) {
  const { data } = await client.get(`/drivers/${id}`);
  return data;
}

export async function fetchSeasons() {
  const { data } = await client.get('/seasons');
  return Array.isArray(data) ? data : [];
}

export async function fetchSeason(id) {
  const { data } = await client.get(`/seasons/${id}`);
  return data;
}

export async function fetchRaces(seasonId) {
  const { data } = await client.get('/races', {
    params: seasonId != null ? { season_id: seasonId } : undefined,
  });
  return Array.isArray(data) ? data : [];
}

/** Summary KPIs + recent races — not the same as analytics charts. */
export async function fetchDashboardStats(opts = {}) {
  const params = {};
  if (opts.teamId != null && opts.teamId !== '') params.team_id = opts.teamId;
  if (opts.driverId != null && opts.driverId !== '') params.driver_id = opts.driverId;
  if (opts.seasonId != null && opts.seasonId !== '') params.season_id = opts.seasonId;
  const { data } = await client.get('/stats/dashboard', { params });
  return data;
}

export async function fetchStandings(seasonId) {
  const { data } = await client.get('/stats/standings', {
    params: { season_id: seasonId },
  });
  return data;
}

/** Charts: races per month, wins per driver, winner performance trend. */
export async function fetchAnalyticsStats() {
  const { data } = await client.get('/stats/analytics');
  return {
    racesPerMonth: Array.isArray(data?.racesPerMonth) ? data.racesPerMonth : [],
    winsPerDriver: Array.isArray(data?.winsPerDriver) ? data.winsPerDriver : [],
    performanceTrend: Array.isArray(data?.performanceTrend) ? data.performanceTrend : [],
  };
}

export async function createTeam(payload) {
  const { data } = await client.post('/teams', payload);
  return data;
}

export async function updateTeam(id, payload) {
  const { data } = await client.put(`/teams/${id}`, payload);
  return data;
}

export async function deleteTeam(id) {
  await client.delete(`/teams/${id}`);
}

export async function createDriver(payload) {
  const { data } = await client.post('/drivers', payload);
  return data;
}

export async function updateDriver(id, payload) {
  const { data } = await client.put(`/drivers/${id}`, payload);
  return data;
}

export async function deleteDriver(id) {
  await client.delete(`/drivers/${id}`);
}

export async function createSeason(payload) {
  const { data } = await client.post('/seasons', payload);
  return data;
}

export async function updateSeason(id, payload) {
  const { data } = await client.put(`/seasons/${id}`, payload);
  return data;
}

export async function deleteSeason(id) {
  await client.delete(`/seasons/${id}`);
}

export async function createRace(payload) {
  const { data } = await client.post('/races', payload);
  return data;
}

export async function updateRace(id, payload) {
  const { data } = await client.put(`/races/${id}`, payload);
  return data;
}

export async function deleteRace(id) {
  await client.delete(`/races/${id}`);
}

/** GET /teams — throws on HTTP error (for health checks) */
export async function pingApi() {
  const { data } = await client.get('/teams');
  return Array.isArray(data);
}

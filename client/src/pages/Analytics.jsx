import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../components/ChartCard.jsx';
import { fetchAnalyticsStats, fetchSeasons, fetchStandings, formatAxiosError } from '../api.js';

const chartTooltip = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: 11,
    color: '#1d1d1f',
    fontSize: 14,
  },
  labelStyle: { color: '#7a7a7a' },
};

const GRID_STROKE = '#f0f0f0';
const AXIS_TICK = '#7a7a7a';

export default function Analytics() {
  const [stats, setStats] = useState({
    racesPerMonth: [],
    winsPerDriver: [],
    performanceTrend: [],
  });
  const [seasons, setSeasons] = useState([]);
  const [standingsSeasonId, setStandingsSeasonId] = useState('');
  const [constructorPoints, setConstructorPoints] = useState([]);
  const [standingsErr, setStandingsErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAnalyticsStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled)
          setStats({ racesPerMonth: [], winsPerDriver: [], performanceTrend: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchSeasons();
        if (cancelled) return;
        setSeasons(s);
        setStandingsSeasonId((prev) => {
          if (prev) return prev;
          if (!s.length) return '';
          const latest = [...s].sort((a, b) => b.year - a.year)[0];
          return String(latest.id);
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!standingsSeasonId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchStandings(Number(standingsSeasonId));
        if (cancelled) return;
        const rows = Array.isArray(data?.constructorStandings) ? data.constructorStandings : [];
        setConstructorPoints(
          rows
            .filter((r) => r.points > 0)
            .map((r) => ({ name: r.name, points: r.points, color: r.color || '#0066cc' }))
        );
        setStandingsErr('');
      } catch (e) {
        if (!cancelled) {
          setConstructorPoints([]);
          setStandingsErr(formatAxiosError(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [standingsSeasonId]);

  const standingsYear = useMemo(() => {
    const s = seasons.find((x) => String(x.id) === String(standingsSeasonId));
    return s?.year ?? '';
  }, [seasons, standingsSeasonId]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-heading">Analytics</h2>
        <p className="mt-1 page-subheading">
          Charts from <code className="text-ink-muted-80">GET /stats/analytics</code> — aggregates on{' '}
          <code className="text-ink-muted-80">races</code> and <code className="text-ink-muted-80">drivers</code> only
          (separate from the dashboard summary).
        </p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-caption text-ink-muted-48">Constructor points by season (from GET /stats/standings)</p>
        <label className="text-caption text-ink-muted-48">
          Season
          <select
            value={standingsSeasonId}
            onChange={(e) => setStandingsSeasonId(e.target.value)}
            className="input-field ml-2 inline-block min-w-[120px]"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.year}
              </option>
            ))}
          </select>
        </label>
      </div>
      {standingsErr ? <p className="text-caption text-rose-700">{standingsErr}</p> : null}
      <div>
        <ChartCard title={`Constructor points ${standingsYear ? `(${standingsYear})` : ''}`} badge="standings">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={constructorPoints} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
              <XAxis type="number" tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: AXIS_TICK, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="points" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900}>
                {constructorPoints.map((entry, i) => (
                  <Cell key={i} fill={entry.color || '#0066cc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Races per month" badge="MySQL">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.racesPerMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="races" fill="#0066cc" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Wins per driver" badge="COUNT(winner)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.winsPerDriver} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
              <XAxis type="number" tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: AXIS_TICK, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="wins" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900}>
                {stats.winsPerDriver.map((entry, i) => (
                  <Cell key={i} fill={entry.color || '#0066cc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title="Winner performance index by race" badge="JOIN drivers">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={stats.performanceTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis dataKey="label" tick={{ fill: AXIS_TICK, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...chartTooltip} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0066cc"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0066cc' }}
              isAnimationActive
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

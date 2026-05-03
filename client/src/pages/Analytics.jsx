import { useEffect, useState } from 'react';
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
import { fetchAnalyticsStats } from '../api.js';

const chartTooltip = {
  contentStyle: {
    background: '#12121A',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#fff',
  },
  labelStyle: { color: '#a1a1aa' },
};

export default function Analytics() {
  const [stats, setStats] = useState({
    racesPerMonth: [],
    winsPerDriver: [],
    performanceTrend: [],
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Analytics</h2>
        <p className="text-sm text-zinc-500">
          Charts from <code className="text-zinc-400">GET /stats/analytics</code> — aggregates on{' '}
          <code className="text-zinc-400">races</code> and <code className="text-zinc-400">drivers</code> only
          (separate from the dashboard summary).
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Races per month" badge="MySQL">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.racesPerMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a33" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="races" fill="#E10600" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Wins per driver" badge="COUNT(winner)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.winsPerDriver}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a33" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="wins" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900}>
                {stats.winsPerDriver.map((entry, i) => (
                  <Cell key={i} fill={entry.color || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title="Winner performance index by race" badge="JOIN drivers">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={stats.performanceTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a33" />
            <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...chartTooltip} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#00D2BE"
              strokeWidth={2}
              dot={{ r: 3, fill: '#00D2BE' }}
              isAnimationActive
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

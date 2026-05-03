import { Link } from 'react-router-dom';

function statusFromScore(score) {
  if (score >= 90) return { label: 'Optimal', tone: 'emerald' };
  if (score >= 75) return { label: 'Stable', tone: 'amber' };
  return { label: 'Watch', tone: 'rose' };
}

const tones = {
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-200 ring-amber-500/25',
  rose: 'bg-rose-500/15 text-rose-200 ring-rose-500/25',
};

const glow = {
  emerald: 'from-emerald-500/25',
  amber: 'from-amber-500/25',
  rose: 'from-rose-500/25',
};

export default function DriverCard({ driver }) {
  const score = driver.performance_score ?? 0;
  const status = statusFromScore(score);
  const role = driver.role || 'Race Driver';
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface p-5 shadow-card">
      <div
        className={`pointer-events-none absolute -right-8 -bottom-16 h-40 w-40 rounded-full bg-gradient-to-br ${glow[status.tone]} to-transparent opacity-70`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <Link to={`/drivers/${driver.id}`} className="text-lg font-semibold text-white hover:text-accent">
            {driver.name}
          </Link>
          <p className="text-xs text-zinc-500">{role}</p>
          <p className="mt-1 text-sm text-zinc-400">{driver.team}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-white"
          style={{ boxShadow: `0 0 0 1px ${driver.color || '#444'}55` }}
        >
          {String(driver.name || '')
            .split(' ')
            .map((s) => s[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Performance</p>
          <span
            className={`mt-1 inline-flex rounded-lg px-2 py-1 text-sm font-semibold ring-1 ring-inset ${tones[status.tone]}`}
          >
            +{score}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Wins</p>
          <span className="mt-1 inline-block rounded-lg bg-white/[0.04] px-2 py-1 text-sm font-medium text-white ring-1 ring-white/10">
            {driver.total_wins ?? 0}
          </span>
        </div>
      </div>
      <Link
        to={`/drivers/${driver.id}`}
        className="relative mt-4 inline-block text-xs font-medium text-accent hover:underline"
      >
        View profile →
      </Link>
    </article>
  );
}

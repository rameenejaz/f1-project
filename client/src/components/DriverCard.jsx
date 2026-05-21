import { Link } from 'react-router-dom';

function statusFromScore(score) {
  if (score >= 90) return { label: 'Optimal', tone: 'optimal' };
  if (score >= 75) return { label: 'Stable', tone: 'stable' };
  return { label: 'Watch', tone: 'watch' };
}

const tones = {
  optimal: 'bg-primary/10 text-primary ring-primary/20',
  stable: 'bg-amber-50 text-amber-800 ring-amber-200',
  watch: 'bg-rose-50 text-rose-800 ring-rose-200',
};

export default function DriverCard({ driver }) {
  const score = driver.performance_score ?? 0;
  const status = statusFromScore(score);
  const role = driver.role || 'Race Driver';
  const initials = String(driver.name || '')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="card-utility-interactive relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/drivers/${driver.id}`} className="text-body-strong text-ink hover:text-primary">
            {driver.name}
          </Link>
          <p className="text-caption text-ink-muted-48">{role}</p>
          <p className="mt-1 text-body text-ink-muted-80">{driver.team}</p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-hairline bg-parchment text-caption-strong text-ink"
          style={{ boxShadow: `inset 0 0 0 2px ${driver.color || '#d2d2d7'}` }}
        >
          {initials}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <p className="section-label">Performance</p>
          <span
            className={`mt-1 inline-flex rounded-md px-2 py-1 text-caption-strong ring-1 ring-inset ${tones[status.tone]}`}
          >
            +{score}
          </span>
        </div>
        <div className="text-right">
          <p className="section-label">Wins</p>
          <span className="mt-1 inline-block rounded-md bg-parchment px-2 py-1 text-caption-strong text-ink ring-1 ring-hairline">
            {driver.total_wins ?? 0}
          </span>
        </div>
      </div>
      <Link to={`/drivers/${driver.id}`} className="mt-4 inline-block text-caption text-primary hover:underline">
        View profile →
      </Link>
    </article>
  );
}

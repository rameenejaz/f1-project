import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, Gauge, Trophy } from 'lucide-react';
import { fetchDriver, formatAxiosError } from '../api.js';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useOutletContext() ?? { isAdmin: true };
  const [driver, setDriver] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const d = await fetchDriver(id);
        if (!cancelled) setDriver(d);
      } catch (e) {
        if (!cancelled) {
          setErr(formatAxiosError(e));
          setDriver(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (err) {
    return (
      <div className="mx-auto max-w-lg space-y-4 card-utility p-8 text-center">
        <p className="text-body text-rose-800">{err}</p>
        <button type="button" onClick={() => navigate('/drivers')} className="text-caption text-primary hover:underline">
          Back to drivers
        </button>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-caption text-ink-muted-48">
        <p>Loading profile…</p>
      </div>
    );
  }

  const initials = String(driver.name || '')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-caption text-ink-muted-48 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back
      </button>

      <article className="card-utility overflow-hidden p-0">
        <div
          className="h-1 w-full"
          style={{ backgroundColor: driver.color || '#0066cc' }}
          aria-hidden
        />
        <div className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-start">
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-hairline bg-parchment text-display-md font-semibold text-ink"
            style={{ boxShadow: `inset 0 0 0 2px ${driver.color || '#d2d2d7'}` }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="section-label">Driver profile</p>
            <h1 className="mt-1 font-display text-display-lg text-ink">{driver.name}</h1>
            <Link to="/teams" className="mt-2 inline-flex items-center gap-2 text-body text-ink-muted-80 hover:text-primary">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-hairline"
                style={{ background: driver.color }}
              />
              {driver.team}
            </Link>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-hairline bg-parchment p-4">
                <Flag className="mb-2 h-4 w-4 text-ink-muted-48" strokeWidth={1.75} />
                <p className="text-caption text-ink-muted-48">Nationality</p>
                <p className="mt-1 text-body-strong text-ink">{driver.nationality}</p>
              </div>
              <div className="rounded-lg border border-hairline bg-parchment p-4">
                <p className="text-caption text-ink-muted-48">F1 debut</p>
                <p className="mt-1 font-display text-display-md text-ink">{driver.start_year}</p>
              </div>
              <div className="rounded-lg border border-hairline bg-parchment p-4">
                <Trophy className="mb-2 h-4 w-4 text-amber-600" strokeWidth={1.75} />
                <p className="text-caption text-ink-muted-48">Total wins</p>
                <p className="mt-1 font-display text-display-md text-ink">{driver.total_wins ?? 0}</p>
              </div>
              <div className="rounded-lg border border-hairline bg-parchment p-4">
                <Gauge className="mb-2 h-4 w-4 text-primary" strokeWidth={1.75} />
                <p className="text-caption text-ink-muted-48">Performance</p>
                <p className="mt-1 font-display text-display-md text-ink">{driver.performance_score}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-hairline px-8 py-8">
          <h2 className="section-label">Bio</h2>
          <p className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-ink-muted-80">
            {driver.description?.trim()
              ? driver.description
              : isAdmin
                ? 'No biography stored yet. Edit this driver on the Drivers page.'
                : 'No biography stored yet.'}
          </p>
        </div>

        {driver.races_won?.length > 0 && (
          <div className="border-t border-hairline px-8 py-8">
            <h2 className="section-label">Races won (from DB)</h2>
            <ul className="mt-4 divide-y divide-divider-soft">
              {driver.races_won.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-body">
                  <span className="text-body-strong text-ink">{r.race_name}</span>
                  <span className="text-caption text-ink-muted-48">
                    {r.season_year} · {r.race_date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <div className="text-center">
        <Link to="/drivers" className="text-caption text-primary hover:underline">
          View all drivers
        </Link>
      </div>
    </div>
  );
}

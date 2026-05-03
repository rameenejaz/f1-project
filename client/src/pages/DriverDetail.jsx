import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, Gauge, Trophy } from 'lucide-react';
import { fetchDriver, formatAxiosError } from '../api.js';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-rose-500/20 bg-surface p-8 text-center">
        <p className="text-rose-200">{err}</p>
        <button type="button" onClick={() => navigate('/drivers')} className="text-sm text-accent hover:underline">
          Back to drivers
        </button>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
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
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-surface shadow-card"
        style={{ boxShadow: `0 0 80px -20px ${driver.color}44` }}
      >
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{
            background: `linear-gradient(90deg, ${driver.color}, transparent, ${driver.color})`,
          }}
        />
        <div className="relative grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-start">
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-3xl font-bold text-white"
            style={{
              background: `linear-gradient(145deg, ${driver.color}33, #12121a)`,
              boxShadow: `inset 0 0 0 1px ${driver.color}55`,
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Driver profile</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{driver.name}</h1>
            <Link
              to="/teams"
              className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/20"
                style={{ background: driver.color }}
              />
              {driver.team}
            </Link>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-white/[0.06] bg-canvas/50 p-4">
                <Flag className="mb-2 h-4 w-4 text-zinc-500" />
                <p className="text-xs text-zinc-500">Nationality</p>
                <p className="mt-1 font-medium text-white">{driver.nationality}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-canvas/50 p-4">
                <p className="text-xs text-zinc-500">F1 debut</p>
                <p className="mt-1 text-2xl font-semibold text-white">{driver.start_year}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-canvas/50 p-4">
                <Trophy className="mb-2 h-4 w-4 text-amber-400/80" />
                <p className="text-xs text-zinc-500">Total wins</p>
                <p className="mt-1 text-2xl font-semibold text-white">{driver.total_wins ?? 0}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-canvas/50 p-4">
                <Gauge className="mb-2 h-4 w-4 text-accent" />
                <p className="text-xs text-zinc-500">Performance</p>
                <p className="mt-1 text-2xl font-semibold text-white">{driver.performance_score}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-8 py-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Bio</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {driver.description?.trim() ? driver.description : 'No biography stored yet. Edit this driver on the Drivers page.'}
          </p>
        </div>

        {driver.races_won?.length > 0 && (
          <div className="border-t border-white/[0.06] px-8 py-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Races won (from DB)</h2>
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {driver.races_won.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-medium text-white">{r.race_name}</span>
                  <span className="text-zinc-500">
                    {r.season_year} · {r.race_date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link to="/drivers" className="text-sm text-accent hover:underline">
          View all drivers
        </Link>
      </div>
    </div>
  );
}

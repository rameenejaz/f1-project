import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Crown, Trophy } from 'lucide-react';
import { fetchSeasons, formatAxiosError } from '../api.js';

export default function Seasons() {
  const { searchQuery } = useOutletContext();
  const [seasons, setSeasons] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchSeasons();
        if (!cancelled) {
          setSeasons(rows);
          setErr('');
        }
      } catch (e) {
        if (!cancelled) setErr(formatAxiosError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleSeasons = useMemo(() => {
    const q = (searchQuery ?? '').trim().toLowerCase();
    if (!q) return seasons;
    return seasons.filter(
      (s) =>
        String(s.year).includes(q) ||
        (s.champion_driver_name || '').toLowerCase().includes(q) ||
        (s.champion_team_name || '').toLowerCase().includes(q)
    );
  }, [seasons, searchQuery]);

  if (err) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-surface p-6 text-rose-200">
        {err}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Seasons</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Champions and race counts from the database. Use the header search to filter by year or champion names.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleSeasons.map((s) => (
          <article
            key={s.id}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface p-6 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                <Calendar className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-300">
                {s.race_count} races
              </span>
            </div>
            <h3 className="mt-4 text-3xl font-bold text-white">{s.year}</h3>
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Crown className="h-4 w-4 shrink-0 text-amber-400/90" />
                <span className="text-zinc-500">Champion driver</span>
              </div>
              <p className="font-medium text-white">{s.champion_driver_name ?? '— TBD'}</p>
              <div className="flex items-center gap-2 text-zinc-400">
                <Trophy className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="text-zinc-500">Champion team</span>
              </div>
              <div className="flex items-center gap-2">
                {s.champion_team_color ? (
                  <span
                    className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20"
                    style={{ background: s.champion_team_color }}
                  />
                ) : null}
                <p className="font-medium text-white">{s.champion_team_name ?? '— TBD'}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
          </article>
        ))}
      </div>
      {visibleSeasons.length === 0 && seasons.length > 0 ? (
        <p className="text-center text-sm text-zinc-500">No seasons match your search.</p>
      ) : null}
      {seasons.length === 0 && !err ? (
        <p className="text-center text-sm text-zinc-500">No seasons in the database. Run <code className="text-zinc-400">schema.sql</code>.</p>
      ) : null}
    </div>
  );
}

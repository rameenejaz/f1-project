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
    return <div className="alert-error">{err}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-heading">Seasons</h2>
        <p className="mt-1 page-subheading">
          Champions and race counts from the database. Use the header search to filter by year or champion names.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleSeasons.map((s) => (
          <article key={s.id} className="card-utility-interactive">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-parchment">
                <Calendar className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <span className="badge-muted">{s.race_count} races</span>
            </div>
            <h3 className="mt-4 font-display text-display-lg text-ink">{s.year}</h3>
            <div className="mt-5 space-y-3 border-t border-divider-soft pt-4 text-body">
              <div className="flex items-center gap-2 text-ink-muted-48">
                <Crown className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-caption">Champion driver</span>
              </div>
              <p className="text-body-strong text-ink">{s.champion_driver_name ?? '— TBD'}</p>
              <div className="flex items-center gap-2 text-ink-muted-48">
                <Trophy className="h-4 w-4 shrink-0" />
                <span className="text-caption">Champion team</span>
              </div>
              <div className="flex items-center gap-2">
                {s.champion_team_color ? (
                  <span
                    className="inline-block h-3 w-3 rounded-full ring-1 ring-hairline"
                    style={{ background: s.champion_team_color }}
                  />
                ) : null}
                <p className="text-body-strong text-ink">{s.champion_team_name ?? '— TBD'}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      {visibleSeasons.length === 0 && seasons.length > 0 ? (
        <p className="text-center text-caption text-ink-muted-48">No seasons match your search.</p>
      ) : null}
      {seasons.length === 0 && !err ? (
        <p className="text-center text-caption text-ink-muted-48">
          No seasons in the database. Run <code className="text-ink-muted-80">schema.sql</code>.
        </p>
      ) : null}
    </div>
  );
}

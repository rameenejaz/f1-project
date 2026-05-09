import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Flag } from 'lucide-react';
import { fetchRaces, fetchSeasons, formatAxiosError } from '../api.js';

const sortKeys = [
  { id: 'race_date', label: 'Date' },
  { id: 'race_name', label: 'Race' },
  { id: 'winner_points', label: 'Points' },
  { id: 'fastest_lap_seconds', label: 'Fastest lap (s)' },
  { id: 'attendance', label: 'Attendance' },
];

function compare(a, b, key, dir) {
  const va = a[key];
  const vb = b[key];
  if (va == null && vb == null) return 0;
  if (va == null) return 1;
  if (vb == null) return -1;
  if (typeof va === 'number' && typeof vb === 'number') return dir * (va - vb);
  return dir * String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' });
}

export default function Races() {
  const [seasons, setSeasons] = useState([]);
  const [seasonId, setSeasonId] = useState('');
  const [races, setRaces] = useState([]);
  const [err, setErr] = useState('');
  const [sortKey, setSortKey] = useState('race_date');
  const [sortDir, setSortDir] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchSeasons();
        if (cancelled) return;
        setSeasons(s);
        setSeasonId((prev) => {
          if (prev) return prev;
          if (!s.length) return '';
          const latest = [...s].sort((a, b) => b.year - a.year)[0];
          return String(latest.id);
        });
      } catch (e) {
        if (!cancelled) setErr(formatAxiosError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!seasonId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchRaces(Number(seasonId));
        if (cancelled) return;
        setRaces(rows);
        setErr('');
      } catch (e) {
        if (!cancelled) {
          setErr(formatAxiosError(e));
          setRaces([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  const sorted = useMemo(() => {
    const list = [...races];
    list.sort((a, b) => compare(a, b, sortKey, sortDir));
    return list;
  }, [races, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(key === 'race_date' || key === 'winner_points' || key === 'fastest_lap_seconds' ? -1 : 1);
    }
  }

  if (err && seasons.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-surface p-6 text-rose-200">{err}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Races</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Read-only calendar per season. Sort by date, points, fastest lap, or crowd size.
          </p>
        </div>
        <label className="text-xs text-zinc-400">
          Season
          <select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className="mt-1 block min-w-[160px] rounded-xl border border-white/10 bg-canvas px-3 py-2 text-sm text-white"
          >
            <option value="">Select season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-surface">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-zinc-500">
              {sortKeys.map(({ id, label }) => (
                <th key={id} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort(id)}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
                  >
                    {label}
                    {sortKey === id &&
                      (sortDir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-zinc-400">Winner</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Fastest lap</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Country</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-zinc-500">
                  {seasonId ? 'No races for this season.' : 'Choose a season to load races.'}
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3 text-zinc-400">{r.race_date}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.race_name}</td>
                  <td className="px-4 py-3 text-zinc-300">{r.winner_points ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.fastest_lap_seconds != null ? r.fastest_lap_seconds.toFixed(3) : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.attendance != null ? r.attendance.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {r.winner_driver_id ? (
                      <Link className="text-accent hover:underline" to={`/drivers/${r.winner_driver_id}`}>
                        {r.winner_name ?? `#${r.winner_driver_id}`}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{r.fastest_lap_driver_name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.host_country ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.race_status ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="flex items-center gap-2 text-xs text-zinc-600">
        <Flag className="h-3.5 w-3.5 text-zinc-500" />
        Data from <code className="text-zinc-500">GET /races?season_id=</code>
      </p>
    </div>
  );
}

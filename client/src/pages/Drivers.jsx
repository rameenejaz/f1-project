import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Pencil, Trash2, X } from 'lucide-react';
import { createDriver, updateDriver, deleteDriver, fetchDrivers, formatAxiosError } from '../api.js';

const columns = [
  { id: 'name', label: 'Driver' },
  { id: 'team', label: 'Team' },
  { id: 'nationality', label: 'Nation' },
  { id: 'start_year', label: 'Debut' },
  { id: 'performance_score', label: 'Score' },
  { id: 'total_wins', label: 'Wins' },
  { id: 'podium_finishes', label: 'Podiums' },
  { id: 'pole_positions', label: 'Poles' },
  { id: 'points', label: 'Points' },
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

function matchesGlobalSearch(query, driver) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    driver.name,
    driver.team,
    driver.nationality,
    driver.start_year,
    driver.performance_score,
    driver.total_wins,
    driver.podium_finishes,
    driver.pole_positions,
    driver.points,
  ]
    .map((x) => (x == null ? '' : String(x)))
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export default function Drivers() {
  const { drivers, teams, reload, searchQuery, isAdmin } = useOutletContext();
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState(1);
  const [filterTeamId, setFilterTeamId] = useState('');
  const [tableDrivers, setTableDrivers] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [addName, setAddName] = useState('');
  const [addTeamId, setAddTeamId] = useState('');
  const [addNat, setAddNat] = useState('');
  const [addYear, setAddYear] = useState(2024);
  const [addScore, setAddScore] = useState(80);
  const [addWins, setAddWins] = useState(0);
  const [addDesc, setAddDesc] = useState('');

  const [modalId, setModalId] = useState(null);
  const [eName, setEName] = useState('');
  const [eTeamId, setETeamId] = useState('');
  const [eNat, setENat] = useState('');
  const [eYear, setEYear] = useState(2020);
  const [eScore, setEScore] = useState(80);
  const [eWins, setEWins] = useState(0);
  const [eDesc, setEDesc] = useState('');

  useEffect(() => {
    let cancelled = false;
    const clientSortKeys = new Set(['team', 'nationality', 'start_year']);
    const sortApi = clientSortKeys.has(sortKey)
      ? 'name'
      : {
          name: 'name',
          total_wins: 'wins',
          podium_finishes: 'podiums',
          pole_positions: 'poles',
          points: 'points',
          performance_score: 'score',
        }[sortKey] || 'name';
    (async () => {
      try {
        const rows = await fetchDrivers({
          teamId: filterTeamId ? Number(filterTeamId) : undefined,
          sort: sortApi,
          order: sortDir === 1 ? 'asc' : 'desc',
        });
        if (!cancelled) setTableDrivers(rows);
      } catch {
        if (!cancelled) setTableDrivers(drivers);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterTeamId, sortKey, sortDir, drivers]);

  const visibleRows = useMemo(() => {
    let list = tableDrivers.filter((d) => matchesGlobalSearch(searchQuery ?? '', d));
    if (['team', 'nationality', 'start_year'].includes(sortKey)) {
      list = [...list];
      list.sort((a, b) => compare(a, b, sortKey, sortDir));
    }
    return list;
  }, [tableDrivers, searchQuery, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(key === 'total_wins' || key === 'points' || key === 'podium_finishes' ? -1 : 1);
    }
  }

  function openModal(d) {
    setModalId(d.id);
    setEName(d.name);
    setETeamId(String(d.team_id));
    setENat(d.nationality);
    setEYear(d.start_year);
    setEScore(d.performance_score);
    setEWins(d.total_wins ?? 0);
    setEDesc(d.description ?? '');
    setMsg('');
  }

  function closeModal() {
    setModalId(null);
  }

  async function onAdd(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      await createDriver({
        name: addName,
        team_id: Number(addTeamId),
        nationality: addNat,
        start_year: addYear,
        performance_score: addScore,
        total_wins: addWins,
        description: addDesc || undefined,
      });
      setAddName('');
      setAddNat('');
      setAddDesc('');
      setAddWins(0);
      await reload();
      setMsg('Driver created.');
    } catch (err) {
      setMsg(formatAxiosError(err));
    } finally {
      setLoading(false);
    }
  }

  async function onSaveModal(e) {
    e.preventDefault();
    if (!modalId) return;
    setLoading(true);
    setMsg('');
    try {
      await updateDriver(modalId, {
        name: eName,
        team_id: Number(eTeamId),
        nationality: eNat,
        start_year: eYear,
        performance_score: eScore,
        total_wins: eWins,
        description: eDesc,
      });
      closeModal();
      await reload();
      setMsg('Driver updated.');
    } catch (err) {
      setMsg(formatAxiosError(err));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id, label) {
    if (!window.confirm(`Delete driver "${label}"?`)) return;
    setMsg('');
    try {
      await deleteDriver(id);
      await reload();
      setMsg('Driver deleted.');
      if (modalId === id) closeModal();
    } catch (err) {
      setMsg(formatAxiosError(err));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="page-heading">Drivers</h2>
          <p className="mt-1 page-subheading">
            Filter by team · header search narrows this list · sort by name or wins · edit in modal · profiles on name.
            {!isAdmin ? ' Driver mode: read-only.' : null}
          </p>
        </div>
        <label className="text-caption text-ink-muted-48">
          Team filter
          <select
            value={filterTeamId}
            onChange={(e) => setFilterTeamId(e.target.value)}
            className="input-field mt-1 block min-w-[200px]"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isAdmin ? (
        <form onSubmit={onAdd} className="card-utility space-y-4">
          <h3 className="text-body-strong text-ink">Add driver</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-caption text-ink-muted-48">
              Full name
              <input value={addName} onChange={(e) => setAddName(e.target.value)} required className="input-field" />
            </label>
            <label className="text-caption text-ink-muted-48">
              Team
              <select value={addTeamId} onChange={(e) => setAddTeamId(e.target.value)} required className="input-field">
                <option value="">Select…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-caption text-ink-muted-48">
              Nationality
              <input value={addNat} onChange={(e) => setAddNat(e.target.value)} required className="input-field" />
            </label>
            <label className="text-caption text-ink-muted-48">
              F1 debut year
              <input type="number" value={addYear} onChange={(e) => setAddYear(Number(e.target.value))} required className="input-field" />
            </label>
            <label className="text-caption text-ink-muted-48">
              Performance (0–100)
              <input type="number" min={0} max={100} value={addScore} onChange={(e) => setAddScore(Number(e.target.value))} required className="input-field" />
            </label>
            <label className="text-caption text-ink-muted-48">
              Total wins
              <input type="number" min={0} value={addWins} onChange={(e) => setAddWins(Number(e.target.value))} className="input-field" />
            </label>
            <label className="text-caption text-ink-muted-48 sm:col-span-2 lg:col-span-3">
              Description
              <textarea
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Career summary, driving style, notable achievements…"
              />
            </label>
          </div>
          <button type="submit" disabled={loading || !addTeamId} className="btn-primary disabled:opacity-50">
            Add driver
          </button>
        </form>
      ) : null}

      <div className="table-shell">
        <table className="w-full min-w-[1040px] text-left text-body">
          <thead>
            <tr className="table-head">
              {columns.map(({ id, label }) => (
                <th key={id} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort(id)}
                    className="inline-flex items-center gap-1 text-ink-muted-48 hover:text-ink"
                  >
                    {label}
                    {sortKey === id &&
                      (sortDir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
              {isAdmin ? <th className="px-4 py-3 text-right font-medium text-ink-muted-48">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 10 : 9} className="px-4 py-10 text-center text-caption text-ink-muted-48">
                  {drivers.length === 0
                    ? 'No drivers loaded.'
                    : 'No drivers match the team filter or header search.'}
                </td>
              </tr>
            ) : (
              visibleRows.map((d) => (
                <tr key={d.id} className="table-row">
                  <td className="px-4 py-3">
                    <Link to={`/drivers/${d.id}`} className="text-body-strong text-ink hover:text-primary">
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted-80">{d.team}</td>
                  <td className="px-4 py-3 text-ink-muted-80">{d.nationality}</td>
                  <td className="px-4 py-3 text-ink-muted-80">{d.start_year}</td>
                  <td className="px-4 py-3 text-ink-muted-80">{d.performance_score}</td>
                  <td className="px-4 py-3 text-ink-muted-80">{d.total_wins ?? 0}</td>
                  <td className="px-4 py-3 text-ink-muted-48">{d.podium_finishes ?? 0}</td>
                  <td className="px-4 py-3 text-ink-muted-48">{d.pole_positions ?? 0}</td>
                  <td className="px-4 py-3 text-ink-muted-80">{d.points ?? 0}</td>
                  {isAdmin ? (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openModal(d)}
                        className="btn-icon-circular mr-1 inline-flex h-9 w-9"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(d.id, d.name)}
                        className="btn-icon-circular inline-flex h-9 w-9 text-rose-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {msg && <p className="text-center text-caption text-ink-muted-48">{msg}</p>}

      {isAdmin && modalId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            aria-label="Close"
            onClick={closeModal}
          />
          <form onSubmit={onSaveModal} className="relative z-10 w-full max-w-lg space-y-4 card-utility">
            <div className="flex items-center justify-between">
              <h3 className="text-body-strong text-ink">Edit driver #{modalId}</h3>
              <button type="button" onClick={closeModal} className="btn-icon-circular h-9 w-9">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-caption text-ink-muted-48">
              Name
              <input value={eName} onChange={(e) => setEName(e.target.value)} required className="input-field" />
            </label>
            <label className="block text-caption text-ink-muted-48">
              Team
              <select value={eTeamId} onChange={(e) => setETeamId(e.target.value)} required className="input-field">
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-caption text-ink-muted-48">
                Nationality
                <input value={eNat} onChange={(e) => setENat(e.target.value)} required className="input-field" />
              </label>
              <label className="block text-caption text-ink-muted-48">
                Debut year
                <input type="number" value={eYear} onChange={(e) => setEYear(Number(e.target.value))} required className="input-field" />
              </label>
              <label className="block text-caption text-ink-muted-48">
                Performance
                <input type="number" min={0} max={100} value={eScore} onChange={(e) => setEScore(Number(e.target.value))} required className="input-field" />
              </label>
              <label className="block text-caption text-ink-muted-48">
                Total wins
                <input type="number" min={0} value={eWins} onChange={(e) => setEWins(Number(e.target.value))} className="input-field" />
              </label>
            </div>
            <label className="block text-caption text-ink-muted-48">
              Description
              <textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} rows={4} className="input-field" />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal} className="btn-pearl-capsule">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

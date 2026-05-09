import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { createTeam, updateTeam, deleteTeam, formatAxiosError } from '../api.js';

const sortKeys = [
  { id: 'name', label: 'Team' },
  { id: 'founded_year', label: 'Founded' },
  { id: 'constructors_titles', label: 'Titles' },
  { id: 'active_status', label: 'Status' },
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

export default function Teams() {
  const { teams, reload, searchQuery, isAdmin } = useOutletContext();
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState(1);
  const [activeFilter, setActiveFilter] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#E10600');
  const [year, setYear] = useState(new Date().getFullYear());
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#E10600');
  const [editYear, setEditYear] = useState(2000);

  const filteredTeams = useMemo(() => {
    let list = teams;
    if (activeFilter) {
      list = list.filter((t) => (t.active_status || 'Active') === activeFilter);
    }
    const q = (searchQuery ?? '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        String(t.founded_year ?? '').includes(q) ||
        String(t.constructors_titles ?? '').includes(q) ||
        (t.active_status || '').toLowerCase().includes(q)
    );
  }, [teams, searchQuery, activeFilter]);

  const sorted = useMemo(() => {
    const list = [...filteredTeams];
    list.sort((a, b) => compare(a, b, sortKey, sortDir));
    return list;
  }, [filteredTeams, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(key === 'constructors_titles' ? -1 : 1);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      await createTeam({ name, color, founded_year: year });
      setName('');
      await reload();
      setMsg('Team created.');
    } catch (err) {
      setMsg(formatAxiosError(err));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(t) {
    setEditing(t.id);
    setEditName(t.name);
    setEditColor(t.color);
    setEditYear(t.founded_year);
    setMsg('');
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    setMsg('');
    try {
      await updateTeam(editing, {
        name: editName,
        color: editColor,
        founded_year: editYear,
      });
      setEditing(null);
      await reload();
      setMsg('Team updated.');
    } catch (err) {
      setMsg(formatAxiosError(err));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id, label) {
    if (!window.confirm(`Delete team "${label}"? Drivers in this team are removed (CASCADE).`)) return;
    setMsg('');
    try {
      await deleteTeam(id);
      await reload();
      setMsg('Team deleted.');
      if (editing === id) setEditing(null);
    } catch (err) {
      setMsg(formatAxiosError(err));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
        <h2 className="text-2xl font-semibold text-white">Teams</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Create, update, delete — persisted in MySQL. Header search filters this table.
          {!isAdmin ? ' Driver mode: read-only.' : null}
        </p>
          </div>
          <label className="text-xs text-zinc-400">
            Status
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="mt-1 block min-w-[140px] rounded-xl border border-white/10 bg-canvas px-3 py-2 text-sm text-white"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06] bg-surface">
          <table className="w-full min-w-[480px] text-left text-sm">
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
                        (sortDir === 1 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium text-zinc-400">Titles</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Color</th>
                {isAdmin ? <th className="px-4 py-3 text-right font-medium text-zinc-400">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-10 text-center text-sm text-zinc-500">
                    {teams.length === 0
                      ? 'No teams loaded.'
                      : 'No teams match the header search.'}
                  </td>
                </tr>
              ) : (
                sorted.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{t.founded_year}</td>
                    <td className="px-4 py-3 text-zinc-400">{t.constructors_titles ?? 0}</td>
                    <td className="px-4 py-3 text-zinc-500">{t.active_status ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-6 w-6 rounded-full border border-white/10"
                        style={{ background: t.color }}
                      />
                    </td>
                    {isAdmin ? (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="mr-2 rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(t.id, t.name)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300"
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
      </div>

      <div className="space-y-6">
        {isAdmin ? (
        <form
          onSubmit={onCreate}
          className="space-y-4 rounded-2xl border border-white/[0.06] bg-surface p-5 shadow-card"
        >
          <h3 className="text-sm font-semibold text-white">Add team</h3>
          <label className="block text-xs text-zinc-400">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-canvas px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Accent (hex)
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-white/10 bg-canvas"
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Founded year
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-canvas px-3 py-2 text-sm text-white"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-accent to-red-700 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-50 motion-safe:transition motion-safe:duration-150"
          >
            {loading ? 'Saving…' : 'Create team'}
          </button>
        </form>
        ) : null}

        {isAdmin && editing != null && (
          <form
            onSubmit={onUpdate}
            className="space-y-4 rounded-2xl border border-accent/30 bg-surface p-5 shadow-card"
          >
            <h3 className="text-sm font-semibold text-white">Edit team #{editing}</h3>
            <label className="block text-xs text-zinc-400">
              Name
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-canvas px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-zinc-400">
              Color
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-white/10 bg-canvas"
              />
            </label>
            <label className="block text-xs text-zinc-400">
              Founded year
              <input
                type="number"
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-canvas px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-white/10 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Save (PUT)
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {msg && <p className="text-center text-xs text-zinc-400">{msg}</p>}
      </div>
    </div>
  );
}

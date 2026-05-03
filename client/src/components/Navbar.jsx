import { Bell, Search, ChevronDown } from 'lucide-react';

export default function Navbar({ teams, selectedTeamId, onTeamChange, searchQuery, onSearchChange }) {
  const q = searchQuery ?? '';
  const setQ = onSearchChange ?? (() => {});

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b border-white/[0.06] bg-canvas/80 px-6 py-4 backdrop-blur-md">
      <div className="relative min-w-[200px] flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQ('');
          }}
          placeholder="Search drivers, teams, seasons…"
          aria-label="Search"
          className="w-full rounded-2xl border border-white/[0.08] bg-surface py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
      </div>
      <div className="relative ml-auto flex items-center gap-3">
        <div className="relative">
          <select
            value={selectedTeamId ?? ''}
            onChange={(e) => onTeamChange(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none rounded-2xl border border-white/[0.08] bg-surface py-2.5 pl-4 pr-10 text-sm font-medium text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
          >
            <option value="">Choose Team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
        <button
          type="button"
          className="relative rounded-xl border border-white/[0.08] bg-surface p-2.5 text-zinc-300 transition hover:border-white/15 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-surface py-1 pl-1 pr-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=f1pilot"
            alt=""
            className="h-9 w-9 rounded-full border border-white/10"
          />
          <span className="hidden text-sm font-medium text-white sm:inline">Race Engineer</span>
        </div>
      </div>
    </header>
  );
}

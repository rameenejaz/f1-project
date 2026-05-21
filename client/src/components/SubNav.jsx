import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Search } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/drivers': 'Drivers',
  '/teams': 'Teams',
  '/seasons': 'Seasons',
  '/races': 'Races',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

function resolveTitle(pathname) {
  if (pathname.startsWith('/drivers/')) return 'Driver profile';
  return PAGE_TITLES[pathname] ?? 'Race Suite';
}

export default function SubNav({
  searchRef,
  teams,
  drivers = [],
  selectedTeamId,
  onTeamChange,
  searchQuery,
  onSearchChange,
  role,
  onRoleChange,
  selectedDriverId,
  onDriverChange,
}) {
  const { pathname } = useLocation();
  const title = resolveTitle(pathname);
  const q = searchQuery ?? '';
  const setQ = onSearchChange ?? (() => {});

  return (
    <div className="sub-nav-frosted">
      <div className="mx-auto flex min-h-sub-nav max-w-content flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <h1 className="shrink-0 font-display text-tagline font-semibold text-ink">{title}</h1>

        <div className="relative min-w-[180px] flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted-48"
            strokeWidth={1.75}
          />
          <input
            ref={searchRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQ('');
            }}
            placeholder="Search drivers, teams, seasons…"
            aria-label="Search"
            className="search-input"
          />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <label htmlFor="nav-role" className="sr-only">
              View as
            </label>
            <select
              id="nav-role"
              value={role ?? 'admin'}
              onChange={(e) => onRoleChange?.(e.target.value)}
              className="select-field min-w-[100px] text-caption"
            >
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted-48" />
          </div>

          {role === 'driver' && drivers.length > 0 ? (
            <div className="relative hidden md:block">
              <label htmlFor="nav-driver" className="sr-only">
                My driver
              </label>
              <select
                id="nav-driver"
                value={selectedDriverId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  onDriverChange?.(v ? Number(v) : null);
                }}
                className="select-field min-w-[140px] text-caption"
              >
                <option value="">All drivers</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted-48" />
            </div>
          ) : null}

          <div className="relative hidden lg:block">
            <label htmlFor="nav-team" className="sr-only">
              Team
            </label>
            <select
              id="nav-team"
              value={selectedTeamId ?? ''}
              onChange={(e) => onTeamChange(e.target.value ? Number(e.target.value) : null)}
              className="select-field min-w-[140px] text-caption"
            >
              <option value="">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted-48" />
          </div>

          <button
            type="button"
            className="btn-icon-circular relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>

          <div className="hidden items-center gap-2 rounded-md border border-hairline bg-canvas py-1 pl-1 pr-3 sm:flex">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=f1pilot"
              alt=""
              className="h-8 w-8 rounded-full border border-hairline"
            />
            <span className="text-caption text-ink-muted-80">
              {role === 'driver' ? 'Driver' : 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

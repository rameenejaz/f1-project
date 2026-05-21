import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/teams', label: 'Teams' },
  { to: '/seasons', label: 'Seasons' },
  { to: '/races', label: 'Races' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

function navClass({ isActive }) {
  return ['global-nav-link', isActive ? 'global-nav-link-active' : ''].filter(Boolean).join(' ');
}

export default function GlobalNav({ onSearchFocus }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-nav-black text-white">
      <div className="mx-auto flex h-global-nav max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2" end>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-caption-strong text-white">
              F1
            </span>
            <span className="hidden font-display text-caption-strong sm:inline">Race Suite</span>
          </NavLink>

          <nav className="hidden items-center gap-5 tablet:flex" aria-label="Main">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navClass}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onSearchFocus}
            className="btn-icon-circular hidden sm:flex"
            aria-label="Focus search"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button type="button" className="btn-icon-circular hidden sm:flex" aria-label="Bag">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="btn-icon-circular tablet:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          className="border-t border-white/10 px-4 py-3 tablet:hidden"
          aria-label="Mobile main"
        >
          <ul className="flex flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="block py-2">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

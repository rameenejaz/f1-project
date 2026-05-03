import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  LineChart,
  Settings,
} from 'lucide-react';

const linkBase =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white';

const linkActive = ({ isActive }) =>
  [
    linkBase,
    isActive
      ? 'bg-white/[0.07] text-white shadow-glow ring-1 ring-white/10'
      : '',
  ].join(' ');

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/teams', label: 'Teams', icon: Shield },
  { to: '/seasons', label: 'Seasons', icon: Calendar },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-surface px-4 py-6 shadow-card">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/90 font-bold text-white shadow-glow">
          F1
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Control</p>
          <p className="text-sm font-semibold text-white">Race Suite</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={label} to={to} end={end} className={linkActive}>
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-white/[0.06] bg-canvas/60 p-3">
        <p className="text-xs text-zinc-500">Season</p>
        <p className="text-sm font-medium text-white">2025 Championship</p>
      </div>
    </aside>
  );
}

import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Calendar, LineChart } from 'lucide-react';

const cards = [
  { to: '/dashboard', title: 'Dashboard', desc: 'KPIs, roster, recent races from DB', icon: LayoutDashboard },
  { to: '/drivers', title: 'Drivers', desc: 'CRUD, filter, profiles', icon: Users },
  { to: '/teams', title: 'Teams', desc: 'CRUD constructors', icon: Shield },
  { to: '/seasons', title: 'Seasons', desc: 'Champions & race counts', icon: Calendar },
  { to: '/analytics', title: 'Analytics', desc: 'Wins, trends, monthly races', icon: LineChart },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">F1 Control Home</h1>
        <p className="mt-2 text-zinc-400">Pick a module — each route loads its own page.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-white/[0.08] bg-surface p-5 shadow-card transition hover:border-accent/40 hover:shadow-glow"
          >
            <Icon className="h-8 w-8 text-accent" strokeWidth={1.5} />
            <h2 className="mt-3 text-lg font-semibold text-white group-hover:text-accent">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

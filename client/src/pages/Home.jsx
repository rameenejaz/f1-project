import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Calendar, Flag, LineChart } from 'lucide-react';

const cards = [
  { to: '/dashboard', title: 'Dashboard', desc: 'KPIs, roster, recent races from DB', icon: LayoutDashboard },
  { to: '/drivers', title: 'Drivers', desc: 'CRUD, filter, profiles', icon: Users },
  { to: '/teams', title: 'Teams', desc: 'CRUD constructors', icon: Shield },
  { to: '/seasons', title: 'Seasons', desc: 'Champions & race counts', icon: Calendar },
  { to: '/races', title: 'Races', desc: 'Per-season calendar, points, fastest laps', icon: Flag },
  { to: '/analytics', title: 'Analytics', desc: 'Wins, trends, monthly races', icon: LineChart },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-prose space-y-12">
      <section className="tile-light -mx-4 px-4 text-center sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h2 className="font-display text-hero-display font-semibold tracking-tight text-ink sm:text-display-lg">
          F1 Race Suite
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lead text-ink-muted-80">
          Operations dashboard for teams, drivers, seasons, and analytics — built with a calm, photography-first layout.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">
            Open dashboard
          </Link>
          <Link to="/drivers" className="btn-secondary-pill">
            Browse drivers
          </Link>
        </div>
      </section>

      <section>
        <h3 className="page-heading">Modules</h3>
        <p className="mt-2 page-subheading">
          Pick a module — each route loads its own page. Use the header to switch Admin or Driver (demo mode, no login).
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {cards.map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="card-utility-interactive group block">
              <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h4 className="mt-3 text-body-strong text-ink group-hover:text-primary">{title}</h4>
              <p className="mt-1 text-caption text-ink-muted-48">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

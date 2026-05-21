import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Trophy, Flag, Gauge, Award, Timer, User } from 'lucide-react';
import ActionCard from '../components/ActionCard.jsx';
import StatCard from '../components/StatCard.jsx';
import HeroSection from '../components/HeroSection.jsx';
import DriverCard from '../components/DriverCard.jsx';
import { actionTiles } from '../data/mockData.js';
import { fetchDashboardStats } from '../api.js';

export default function Dashboard() {
  const { teams, drivers, selectedTeamId, setSelectedTeamId, searchQuery, role, selectedDriverId } =
    useOutletContext();
  const [summary, setSummary] = useState({
    totals: { teams: 0, drivers: 0, races: 0, seasons: 0 },
    team: null,
    recent_races: [],
    current_season: null,
    driver_standings_snippet: [],
    constructor_standings_snippet: [],
    top_drivers: [],
    top_teams: [],
    fastest_laps_season: [],
    driver_scope: null,
  });

  const team = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? teams[0],
    [teams, selectedTeamId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardStats({
          teamId: team?.id ?? null,
          driverId: role === 'driver' && selectedDriverId ? selectedDriverId : undefined,
        });
        if (!cancelled) setSummary(data);
      } catch {
        if (!cancelled)
          setSummary({
            totals: { teams: 0, drivers: 0, races: 0, seasons: 0 },
            team: null,
            recent_races: [],
            current_season: null,
            driver_standings_snippet: [],
            constructor_standings_snippet: [],
            top_drivers: [],
            top_teams: [],
            fastest_laps_season: [],
            driver_scope: null,
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [team?.id, role, selectedDriverId]);

  const filteredDrivers = useMemo(() => {
    let list = !team?.id ? drivers : drivers.filter((d) => d.team_id === team.id);
    const q = (searchQuery ?? '').trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        [d.name, d.team, d.nationality].join(' ').toLowerCase().includes(q)
      );
    }
    return list;
  }, [drivers, team, searchQuery]);

  const cycle = (delta) => {
    if (!teams.length) return;
    const idx = teams.findIndex((t) => t.id === selectedTeamId);
    const next = (idx + delta + teams.length) % teams.length;
    setSelectedTeamId(teams[next].id);
  };

  const ts = summary.totals ?? {};
  const teamStats = summary.team;
  const cs = summary.current_season;
  const myDriver = drivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-label">Welcome back</p>
        <h2 className="page-heading">Race Operations</h2>
        <p className="mt-1 text-caption text-ink-muted-48">
          Live counts and recent results from MySQL
          {role === 'driver' && selectedDriverId && myDriver
            ? ` · scoped to ${myDriver.name}`
            : role === 'driver'
              ? ' · driver mode (pick “my driver” in the header for your stats)'
              : null}
          .
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actionTiles.map((a) => (
          <ActionCard key={a.id} label={a.label} icon={a.icon} />
        ))}
      </section>

      {summary.driver_scope && role === 'driver' && selectedDriverId ? (
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard icon={Trophy} label="My race wins" value={String(summary.driver_scope.wins ?? 0)} sub="From races table" />
          <StatCard icon={Award} label="My points (wins)" value={String(summary.driver_scope.points ?? 0)} sub="Sum of winner_points" />
          <StatCard icon={Timer} label="Fastest laps set" value={String(summary.driver_scope.fastest_laps ?? 0)} sub="fastest_lap_driver_id" />
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card-utility p-6">
          <HeroSection
            teamName={team?.name ?? 'Select a team'}
            subtitle={`Founded ${team?.founded_year ?? '—'} · ${filteredDrivers.length} drivers in roster`}
            accentColor={team?.color ?? '#0066cc'}
            onPrev={() => cycle(-1)}
            onNext={() => cycle(1)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <StatCard icon={Trophy} label="Seasons" value={String(ts.seasons ?? 0)} sub="In database" />
          <StatCard icon={Flag} label="Races logged" value={String(ts.races ?? 0)} sub="All seasons" />
          <StatCard icon={Gauge} label="Grid size" value={String(ts.drivers ?? 0)} sub="Total drivers" />
        </div>
      </section>

      {cs ? (
        <section className="card-utility">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-body-strong text-ink">Current season</h3>
            <span className="badge-muted">
              {cs.completed_rounds}/{cs.planned_rounds} rounds
            </span>
          </div>
          <p className="mt-2 font-display text-display-lg text-ink">{cs.year}</p>
          <Link to="/races" className="mt-2 inline-block text-caption text-primary hover:underline">
            View races calendar →
          </Link>
        </section>
      ) : null}

      {teamStats ? (
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Award}
            label={`${teamStats.team?.name ?? 'Team'}`}
            value={`${teamStats.driver_count ?? 0} drivers`}
            sub={`Avg performance ${teamStats.avg_performance ?? 0}`}
          />
          <StatCard icon={Trophy} label="Team wins (field)" value={String(teamStats.total_wins ?? 0)} sub="Sum of driver total_wins" />
          <StatCard icon={Flag} label="Constructors" value={String(ts.teams ?? 0)} sub="Teams in DB" />
        </section>
      ) : null}

      {(summary.top_drivers ?? []).length > 0 ? (
        <section className="card-utility">
          <h3 className="text-body-strong text-ink">Top drivers by points</h3>
          <ul className="mt-3 divide-y divide-divider-soft text-body">
            {summary.top_drivers.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex items-center gap-2 text-body-strong text-ink">
                  <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-hairline" style={{ background: d.color || '#888' }} />
                  <Link to={`/drivers/${d.id}`} className="hover:text-primary">
                    {d.name}
                  </Link>
                </span>
                <span className="text-caption text-ink-muted-48">{d.race_wins} wins</span>
                <span className="text-caption-strong text-primary">{d.points} pts</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(summary.top_teams ?? []).length > 0 ? (
        <section className="card-utility">
          <h3 className="text-body-strong text-ink">Top teams by points</h3>
          <ul className="mt-3 divide-y divide-divider-soft text-body">
            {summary.top_teams.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex items-center gap-2 text-body-strong text-ink">
                  <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-hairline" style={{ background: t.color || '#888' }} />
                  {t.name}
                </span>
                <span className="text-caption-strong text-primary">{t.points} pts</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(summary.driver_standings_snippet ?? []).length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card-utility">
            <h3 className="text-body-strong text-ink">Driver standings {cs?.year ? `(${cs.year})` : ''}</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-body">
              {summary.driver_standings_snippet.map((d, i) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-caption text-ink-muted-48">{i + 1}</span>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.team_color || '#666' }} />
                    <Link to={`/drivers/${d.id}`} className="text-body-strong text-ink hover:text-primary">
                      {d.name}
                    </Link>
                  </span>
                  <span className="text-caption text-primary">{d.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-utility">
            <h3 className="text-body-strong text-ink">Constructor standings</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-body">
              {summary.constructor_standings_snippet.map((t, i) => (
                <li key={t.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-caption text-ink-muted-48">{i + 1}</span>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: t.color || '#666' }} />
                    <span className="text-body-strong text-ink">{t.name}</span>
                  </span>
                  <span className="text-caption text-primary">{t.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {(summary.fastest_laps_season ?? []).length > 0 ? (
        <section className="card-utility">
          <h3 className="text-body-strong text-ink">Fastest laps (selected season)</h3>
          <ul className="mt-3 divide-y divide-divider-soft text-body">
            {summary.fastest_laps_season.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-body-strong text-ink">{r.race_name}</span>
                <span className="text-caption text-ink-muted-48">{r.race_date}</span>
                <span className="text-caption text-primary">{r.driver_name}</span>
                <span className="text-caption text-ink-muted-80">{r.fastest_lap_seconds.toFixed(3)}s</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-utility">
        <h3 className="text-body-strong text-ink">Recent races</h3>
        <ul className="mt-3 divide-y divide-divider-soft text-body">
          {(summary.recent_races ?? []).length === 0 ? (
            <li className="py-2 text-ink-muted-48">No races in database yet.</li>
          ) : (
            summary.recent_races.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-body-strong text-ink">{r.race_name}</span>
                <span className="text-caption text-ink-muted-48">
                  {r.season_year} · {r.race_date}
                </span>
                <span className="text-caption text-primary">{r.winner_name ?? '—'}</span>
                {r.winner_points != null ? (
                  <span className="text-caption text-ink-muted-48">{r.winner_points} pts</span>
                ) : null}
                {r.fastest_lap_driver_name ? (
                  <span className="text-caption text-ink-muted-48">FL: {r.fastest_lap_driver_name}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <h3 className="text-body-strong text-ink">Driver roster</h3>
          </div>
          <span className="text-caption text-ink-muted-48">{filteredDrivers.length} drivers</span>
        </div>
        {filteredDrivers.length === 0 ? (
          <p className="card-utility py-8 text-center text-caption text-ink-muted-48">
            No drivers match the selected team or header search.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDrivers.map((d) => (
              <DriverCard key={d.id} driver={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

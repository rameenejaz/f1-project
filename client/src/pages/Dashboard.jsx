import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trophy, Flag, Gauge, Award } from 'lucide-react';
import ActionCard from '../components/ActionCard.jsx';
import StatCard from '../components/StatCard.jsx';
import HeroSection from '../components/HeroSection.jsx';
import DriverCard from '../components/DriverCard.jsx';
import { actionTiles } from '../data/mockData.js';
import { fetchDashboardStats } from '../api.js';

export default function Dashboard() {
  const { teams, drivers, selectedTeamId, setSelectedTeamId, searchQuery } = useOutletContext();
  const [summary, setSummary] = useState({
    totals: { teams: 0, drivers: 0, races: 0, seasons: 0 },
    team: null,
    recent_races: [],
  });

  const team = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? teams[0],
    [teams, selectedTeamId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardStats(team?.id ?? null);
        if (!cancelled) setSummary(data);
      } catch {
        if (!cancelled)
          setSummary({
            totals: { teams: 0, drivers: 0, races: 0, seasons: 0 },
            team: null,
            recent_races: [],
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [team?.id]);

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Welcome back</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Race Operations</h2>
        <p className="mt-1 text-xs text-zinc-600">Live counts and recent results from MySQL.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actionTiles.map((a) => (
          <ActionCard key={a.id} label={a.label} icon={a.icon} accent={a.accent} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-white/[0.06] bg-surface/80 p-6 shadow-card">
          <HeroSection
            teamName={team?.name ?? 'Select a team'}
            subtitle={`Founded ${team?.founded_year ?? '—'} · ${filteredDrivers.length} drivers in roster`}
            accentColor={team?.color ?? '#E10600'}
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

      {teamStats ? (
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Award}
            label={`${teamStats.team?.name ?? 'Team'}`}
            value={`${teamStats.driver_count ?? 0} drivers`}
            sub={`Avg performance ${teamStats.avg_performance ?? 0}`}
          />
          <StatCard
            icon={Trophy}
            label="Team wins (field)"
            value={String(teamStats.total_wins ?? 0)}
            sub="Sum of driver total_wins"
          />
          <StatCard icon={Flag} label="Constructors" value={String(ts.teams ?? 0)} sub="Teams in DB" />
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/[0.06] bg-surface p-5 shadow-card">
        <h3 className="text-sm font-semibold text-white">Recent races</h3>
        <ul className="mt-3 divide-y divide-white/[0.06] text-sm">
          {(summary.recent_races ?? []).length === 0 ? (
            <li className="py-2 text-zinc-500">No races in database yet.</li>
          ) : (
            summary.recent_races.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2 text-zinc-300">
                <span className="font-medium text-white">{r.race_name}</span>
                <span className="text-xs text-zinc-500">
                  {r.season_year} · {r.race_date}
                </span>
                <span className="text-xs text-accent">{r.winner_name ?? '—'}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-white">Driver roster</h3>
          </div>
          <span className="text-xs text-zinc-500">{filteredDrivers.length} drivers</span>
        </div>
        {filteredDrivers.length === 0 ? (
          <p className="rounded-2xl border border-white/[0.06] bg-surface px-4 py-8 text-center text-sm text-zinc-500">
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

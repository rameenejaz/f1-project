import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { fetchDrivers, fetchTeams, formatAxiosError } from '../api.js';

export default function MainLayout() {
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const reload = useCallback(async () => {
    setLoadError('');
    try {
      const [t, d] = await Promise.all([fetchTeams(), fetchDrivers()]);
      setTeams(t);
      setDrivers(d);
      setSelectedTeamId((prev) => (t.some((x) => x.id === prev) ? prev : t[0]?.id ?? null));
    } catch (e) {
      setLoadError(formatAxiosError(e));
      setTeams([]);
      setDrivers([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, d] = await Promise.all([fetchTeams(), fetchDrivers()]);
        if (cancelled) return;
        setTeams(t);
        setDrivers(d);
        setSelectedTeamId((prev) => prev ?? t[0]?.id ?? null);
        setLoadError('');
      } catch (e) {
        if (cancelled) return;
        setLoadError(formatAxiosError(e));
        setTeams([]);
        setDrivers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ctx = useMemo(
    () => ({
      teams,
      drivers,
      selectedTeamId,
      setSelectedTeamId,
      setTeams,
      setDrivers,
      reload,
      loadError,
      searchQuery,
      setSearchQuery,
    }),
    [teams, drivers, selectedTeamId, reload, loadError, searchQuery]
  );

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Sidebar />
      <div className="pl-64">
        <Navbar
          teams={teams}
          selectedTeamId={selectedTeamId}
          onTeamChange={(id) => setSelectedTeamId(id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="p-6">
          {loadError ? (
            <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <p className="font-medium text-white">Could not load data from the API</p>
              <p className="mt-1 text-rose-100/90">{loadError}</p>
            </div>
          ) : null}
          <Outlet context={ctx} />
        </main>
      </div>
    </div>
  );
}

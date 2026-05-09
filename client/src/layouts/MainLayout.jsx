import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { fetchDrivers, fetchTeams, formatAxiosError } from '../api.js';

const STORAGE_ROLE = 'f1-demo-role';
const STORAGE_DRIVER = 'f1-demo-driver-id';

function readStoredRole() {
  try {
    const v = localStorage.getItem(STORAGE_ROLE);
    if (v === 'admin' || v === 'driver') return v;
  } catch {
    /* ignore */
  }
  return 'admin';
}

function readStoredDriverId() {
  try {
    const v = localStorage.getItem(STORAGE_DRIVER);
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export default function MainLayout() {
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRoleState] = useState(readStoredRole);
  const [selectedDriverId, setSelectedDriverIdState] = useState(readStoredDriverId);

  const setRole = useCallback((next) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_ROLE, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setSelectedDriverId = useCallback((id) => {
    setSelectedDriverIdState(id);
    try {
      if (id == null) localStorage.removeItem(STORAGE_DRIVER);
      else localStorage.setItem(STORAGE_DRIVER, String(id));
    } catch {
      /* ignore */
    }
  }, []);

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

  useEffect(() => {
    if (selectedDriverId == null) return;
    if (!drivers.some((d) => d.id === selectedDriverId)) {
      setSelectedDriverId(null);
    }
  }, [drivers, selectedDriverId, setSelectedDriverId]);

  const isAdmin = role === 'admin';

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
      role,
      setRole,
      selectedDriverId,
      setSelectedDriverId,
      isAdmin,
    }),
    [
      teams,
      drivers,
      selectedTeamId,
      reload,
      loadError,
      searchQuery,
      role,
      setRole,
      selectedDriverId,
      setSelectedDriverId,
      isAdmin,
    ]
  );

  return (
    <div className="layout-main-bg min-h-screen bg-canvas text-white">
      <Sidebar />
      <div className="pl-64">
        <Navbar
          teams={teams}
          drivers={drivers}
          selectedTeamId={selectedTeamId}
          onTeamChange={(id) => setSelectedTeamId(id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          role={role}
          onRoleChange={setRole}
          selectedDriverId={selectedDriverId}
          onDriverChange={setSelectedDriverId}
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

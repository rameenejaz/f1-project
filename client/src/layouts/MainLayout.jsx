import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import GlobalNav from '../components/GlobalNav.jsx';
import SubNav from '../components/SubNav.jsx';
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
  const searchRef = useRef(null);
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
    <div className="min-h-screen bg-parchment">
      <GlobalNav onSearchFocus={() => searchRef.current?.focus()} />
      <SubNav
        searchRef={searchRef}
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
      <main className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        {loadError ? (
          <div className="alert-error mb-6">
            <p className="text-body-strong text-ink">Could not load data from the API</p>
            <p className="mt-1 text-caption">{loadError}</p>
          </div>
        ) : null}
        <Outlet context={ctx} />
      </main>
      <footer className="mt-section border-t border-hairline bg-parchment px-4 py-16 text-fine-print text-ink-muted-80 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <p className="text-caption-strong text-ink">F1 Race Suite</p>
          <p className="mt-2 max-w-prose leading-[2.41]">
            Driver and team operations dashboard — seasons, races, standings, and analytics from MySQL.
          </p>
          <p className="mt-8 text-ink-muted-48">Copyright © {new Date().getFullYear()} F1 Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

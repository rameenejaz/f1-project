import { useEffect, useState } from 'react';
import { Bell, Moon, User, Sparkles } from 'lucide-react';

const LS_NOTIFY = 'f1-settings-notify';

function loadBool(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return v === '1';
  } catch {
    return fallback;
  }
}

function saveBool(key, value) {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export default function Settings() {
  const [notify, setNotify] = useState(() => loadBool(LS_NOTIFY, true));

  useEffect(() => {
    saveBool(LS_NOTIFY, notify);
  }, [notify]);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">Personal preferences for your Race Suite. These stay on this device.</p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
            <User className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-xs text-zinc-500">Signed in as Race Engineer</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          Name and role are shown in the header. Account linking can be added later if your course requires it.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
            <Bell className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
          </div>
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-canvas/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Session reminders</p>
            <p className="text-xs text-zinc-500">Optional in-app hints before race weekends</p>
          </div>
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-5 w-5 rounded border-white/20 bg-canvas accent-accent"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
            <Moon className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
          </div>
          <h3 className="font-semibold">Appearance</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          The suite uses a fixed dark cockpit theme for readability and focus.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-surface/80 p-6 shadow-card">
        <div className="flex items-center gap-3 text-white">
          <Sparkles className="h-5 w-5 text-accent" strokeWidth={1.75} />
          <h3 className="font-semibold">About</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Control Race Suite</span> — F1-style dashboard for teams,
          drivers, seasons, and analytics.
        </p>
        <p className="mt-2 text-xs text-zinc-600">Version 1.0</p>
      </section>
    </div>
  );
}

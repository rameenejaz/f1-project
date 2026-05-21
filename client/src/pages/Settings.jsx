import { useEffect, useState } from 'react';
import { Bell, User, Sparkles } from 'lucide-react';

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
    <div className="mx-auto max-w-prose space-y-8">
      <div>
        <h2 className="page-heading">Settings</h2>
        <p className="mt-1 page-subheading">Personal preferences for your Race Suite. These stay on this device.</p>
      </div>

      <section className="card-utility">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-parchment">
            <User className="h-5 w-5 text-ink-muted-48" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-body-strong text-ink">Profile</h3>
            <p className="text-caption text-ink-muted-48">Signed in as Race Engineer</p>
          </div>
        </div>
        <p className="mt-4 text-body text-ink-muted-80">
          Name and role are shown in the header. Account linking can be added later if your course requires it.
        </p>
      </section>

      <section className="card-utility">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-parchment">
            <Bell className="h-5 w-5 text-ink-muted-48" strokeWidth={1.75} />
          </div>
          <h3 className="text-body-strong text-ink">Notifications</h3>
        </div>
        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-hairline bg-parchment px-4 py-3">
          <div>
            <p className="text-body-strong text-ink">Session reminders</p>
            <p className="text-caption text-ink-muted-48">Optional in-app hints before race weekends</p>
          </div>
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-5 w-5 rounded border-hairline accent-primary"
          />
        </label>
      </section>

      <section className="card-utility">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.75} />
          <h3 className="text-body-strong text-ink">Appearance</h3>
        </div>
        <p className="mt-3 text-body text-ink-muted-48">
          Light mode only — calm parchment canvas, Action Blue accents, and minimal chrome per the design system.
        </p>
      </section>

      <section className="card-utility bg-parchment">
        <h3 className="text-body-strong text-ink">About</h3>
        <p className="mt-3 text-body text-ink-muted-80">
          <span className="text-body-strong text-ink">F1 Race Suite</span> — dashboard for teams, drivers, seasons, and analytics.
        </p>
        <p className="mt-2 text-fine-print text-ink-muted-48">Version 1.0</p>
      </section>
    </div>
  );
}

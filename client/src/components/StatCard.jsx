export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-surface/90 px-4 py-3 shadow-card">
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-accent">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-surface/95 px-4 py-3 shadow-card ring-1 ring-white/[0.04] motion-safe:transition motion-safe:duration-200 motion-safe:hover:ring-accent/25">
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

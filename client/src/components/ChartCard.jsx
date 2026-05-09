export default function ChartCard({ title, badge, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-surface p-5 shadow-card ring-1 ring-white/[0.04] motion-safe:transition motion-safe:duration-200 motion-safe:hover:ring-white/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {badge && (
          <span className="rounded-full border border-white/10 bg-canvas px-3 py-1 text-xs text-zinc-400">
            {badge}
          </span>
        )}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

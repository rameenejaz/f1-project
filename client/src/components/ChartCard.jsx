export default function ChartCard({ title, badge, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface p-5 shadow-card">
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

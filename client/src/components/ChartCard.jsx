export default function ChartCard({ title, badge, children }) {
  return (
    <div className="card-utility">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-body-strong text-ink">{title}</h3>
        {badge && <span className="badge-muted">{badge}</span>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

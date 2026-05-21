export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card-utility flex items-center gap-4 px-5 py-4">
      {Icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-parchment text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="font-display text-2xl font-semibold tracking-tight text-ink">{value}</p>
        <p className="text-caption-strong text-ink-muted-48">{label}</p>
        {sub && <p className="text-fine-print text-ink-muted-48">{sub}</p>}
      </div>
    </div>
  );
}

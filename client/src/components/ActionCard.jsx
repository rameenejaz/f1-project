import { Key, CircleDot, Cog, Battery, Disc, Lock, Circle } from 'lucide-react';

const icons = {
  key: Key,
  wheel: CircleDot,
  gear: Cog,
  battery: Battery,
  disc: Disc,
  lock: Lock,
};

export default function ActionCard({ label, icon }) {
  const Icon = icons[icon] || Circle;
  return (
    <button
      type="button"
      className="card-utility-interactive group flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center active:scale-95"
    >
      <Icon className="h-7 w-7 text-primary motion-safe:transition-transform motion-safe:duration-150 group-hover:scale-105" strokeWidth={1.5} />
      <span className="text-caption-strong uppercase tracking-wide text-ink-muted-80 group-hover:text-ink">
        {label}
      </span>
    </button>
  );
}

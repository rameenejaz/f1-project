import { Key, CircleDot, Cog, Battery, Disc, Lock, Circle } from 'lucide-react';

const icons = {
  key: Key,
  wheel: CircleDot,
  gear: Cog,
  battery: Battery,
  disc: Disc,
  lock: Lock,
};

export default function ActionCard({ label, icon, accent }) {
  const Icon = icons[icon] || Circle;
  return (
    <button
      type="button"
      className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-surface p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow"
    >
      <Icon
        className={`h-7 w-7 transition group-hover:scale-105 ${accent ? 'text-accent' : 'text-zinc-200'}`}
        strokeWidth={1.5}
      />
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-300 group-hover:text-white">
        {label}
      </span>
    </button>
  );
}

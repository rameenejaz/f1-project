import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection({
  teamName,
  subtitle,
  accentColor,
  onPrev,
  onNext,
}) {
  return (
    <div className="relative flex flex-1 flex-col justify-center gap-6">
      <div
        className="pointer-events-none absolute -left-8 -top-12 h-48 w-48 rounded-full bg-accent/15 blur-3xl motion-safe:transition-opacity"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Constructor</p>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-white md:text-4xl">{teamName}</h1>
          <p className="mt-2 max-w-lg text-sm text-zinc-400">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-surface text-zinc-300 transition hover:border-accent/40 hover:text-white"
            aria-label="Previous team"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-surface text-zinc-300 transition hover:border-accent/40 hover:text-white"
            aria-label="Next team"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        className="h-1 w-full max-w-md rounded-full opacity-90"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
        aria-hidden
      />
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection({ teamName, subtitle, accentColor, onPrev, onNext }) {
  return (
    <div className="relative flex flex-1 flex-col justify-center gap-6">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">Constructor</p>
          <h2 className="mt-1 max-w-xl font-display text-display-lg font-semibold tracking-tight text-ink">
            {teamName}
          </h2>
          <p className="mt-2 max-w-lg text-body text-ink-muted-48">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="btn-icon-circular"
            aria-label="Previous team"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="btn-icon-circular"
            aria-label="Next team"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <div
        className="h-0.5 w-full max-w-md rounded-full"
        style={{ backgroundColor: accentColor || '#0066cc' }}
        aria-hidden
      />
    </div>
  );
}

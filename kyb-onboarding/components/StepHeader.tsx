import { ChevronLeft } from "lucide-react";

export function StepHeader({
  step,
  title,
  progress = 0,
  onBack,
}: {
  step: string;
  title: string;
  progress?: number;
  onBack?: () => void;
}) {
  return (
    <div className="bg-surface-card border-b border-line-subtle">
      <div className="h-1 w-full bg-line-subtle">
        <div className="h-full bg-brand transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
      </div>
      <div className="flex items-start gap-2.5 px-5 pt-4 pb-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-7 h-7 -ml-1.5 mt-0.5 flex items-center justify-center rounded-full text-fg-secondary hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
        ) : null}
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-fg-tertiary">{step}</span>
          <h1 className="text-[22px] font-bold tracking-tight text-fg-primary mt-1">{title}</h1>
        </div>
      </div>
    </div>
  );
}

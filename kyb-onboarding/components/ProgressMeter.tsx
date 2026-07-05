export function ProgressMeter({ done, total, verb }: { done: number; total: number; verb: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-fg-secondary">
          {done} of {total} {verb}
        </span>
        <span className="text-[13px] font-semibold text-fg-primary">{pct}%</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={["h-1.5 flex-1 rounded-full transition-colors", i < done ? "bg-pos" : "bg-line"].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

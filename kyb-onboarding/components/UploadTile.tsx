import { Upload, Loader2 } from "lucide-react";

export function Dropzone({
  title,
  hint,
  onPick,
  dense,
}: {
  title: string;
  hint: string;
  onPick: () => void;
  dense?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={[
        "w-full rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-2 text-center hover:border-brand hover:bg-surface-hover transition-colors",
        dense ? "py-7 px-4" : "py-10 px-4",
      ].join(" ")}
    >
      <Upload className="w-6 h-6 text-fg-tertiary" strokeWidth={1.75} />
      <span className="text-[15px] font-semibold text-fg-primary">{title}</span>
      <span className="text-[13px] text-fg-tertiary">{hint}</span>
    </button>
  );
}

// Fixed-size transient tile: same footprint as the dropzone, just a spinner
// with state-specific copy — no progress bar, no layout shift.
export function ProcessingTile({
  status,
  label,
  dense,
}: {
  status: string;
  label: string;
  dense?: boolean;
}) {
  const text = status === "uploading" ? `Uploading ${label}…` : `Verifying ${label}…`;
  return (
    <div
      className={[
        "w-full rounded-xl border border-line bg-surface-card flex flex-col items-center justify-center gap-3",
        dense ? "py-7 px-4" : "py-10 px-4",
      ].join(" ")}
    >
      <Loader2 className="w-6 h-6 text-brand animate-spin" strokeWidth={2} />
      <span className="text-[14px] font-medium text-fg-secondary">{text}</span>
    </div>
  );
}

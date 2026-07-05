import { Check, Loader2 } from "lucide-react";

export function StatusBadge({ kind }: { kind: "verified" | "verifying" }) {
  if (kind === "verifying") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-subtle text-brand px-2.5 h-7 text-[12px] font-semibold">
        <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
        Verifying
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pos-bg text-pos-fg border border-pos-border px-2.5 h-7 text-[12px] font-semibold">
      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
      Verified
    </span>
  );
}

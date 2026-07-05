import { X } from "lucide-react";
import { DocFull } from "./DocImage";

export function DocViewer({
  open,
  label,
  meta,
  onClose,
}: {
  open: boolean;
  label: string;
  meta?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/75" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-4 text-white shrink-0">
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[16px] font-semibold truncate">{label}</span>
          {meta ? <span className="text-[13px] text-white/60 font-mono truncate">{meta}</span> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6" onClick={(e) => e.stopPropagation()}>
        <div className="min-h-full flex items-center justify-center">
          <DocFull label={label} />
        </div>
      </div>
    </div>
  );
}

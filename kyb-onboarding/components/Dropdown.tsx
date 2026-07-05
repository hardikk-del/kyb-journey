import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export function Dropdown({
  value,
  options,
  onChange,
  disabled,
  disabledOptions = [],
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  disabledOptions?: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / scroll — without a fixed overlay that would
  // block the page from scrolling while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Hide options claimed by the other slot; always keep the current value.
  const visible = options.filter((o) => o === value || !disabledOptions.includes(o));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={[
          "w-full flex items-center justify-between gap-2 h-12 px-3.5 rounded-lg border bg-surface-card text-[14px] font-medium transition-colors",
          disabled ? "border-line-subtle text-fg-tertiary cursor-not-allowed" : "border-line text-fg-primary hover:bg-surface-hover",
        ].join(" ")}
      >
        <span className={["truncate text-left", value ? "" : "text-fg-tertiary"].join(" ")}>{value || placeholder}</span>
        {!disabled ? (
          <ChevronDown className={["w-4 h-4 text-fg-tertiary transition-transform shrink-0", open ? "rotate-180" : ""].join(" ")} strokeWidth={2} />
        ) : null}
      </button>

      {open && !disabled ? (
        <div
          className="absolute z-30 top-full mt-1.5 w-full rounded-lg border border-line bg-surface-card overflow-y-auto max-h-[240px] py-1"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          {visible.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-3.5 h-11 text-left text-[14px] text-fg-primary hover:bg-surface-hover transition-colors"
            >
              <span className="truncate">{o}</span>
              {o === value ? <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={2.5} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

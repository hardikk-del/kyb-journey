import { Eye } from "lucide-react";
import { assetFor } from "../lib/docAssets";

function fauxHeader(v: string): [string, string] {
  const k = v.toLowerCase();
  if (k.includes("aadhaar") || k.includes("aadhar")) return ["UNIQUE IDENTIFICATION AUTHORITY", "AADHAAR"];
  if (k.includes("pan")) return ["INCOME TAX DEPARTMENT", "GOVT. OF INDIA"];
  if (k.includes("gst") || k.includes("vat") || k.includes("cst")) return ["GOODS & SERVICES TAX", "GOVT. OF INDIA"];
  if (k.includes("util") || k.includes("electric")) return ["TANGEDCO", "ELECTRICITY BILL"];
  if (k.includes("driv")) return ["TRANSPORT DEPARTMENT", "DRIVING LICENCE"];
  if (k.includes("pass")) return ["REPUBLIC OF INDIA", "PASSPORT"];
  if (k.includes("voter")) return ["ELECTION COMMISSION", "VOTER ID"];
  if (k.includes("shop")) return ["MUNICIPAL CORPORATION", "SHOPS & ESTT."];
  if (k.includes("udyam") || k.includes("msme")) return ["MINISTRY OF MSME", "UDYAM CERTIFICATE"];
  if (k.includes("trade")) return ["LOCAL BODY", "TRADE LICENCE"];
  if (k.includes("statement") || k.includes("account")) return ["BANK OF INDIA", "ACCOUNT STATEMENT"];
  return ["GOVERNMENT OF INDIA", "VERIFIED DOCUMENT"];
}

// CSS-rendered redacted document — stands in for a real scan until an asset URL exists.
function FauxDoc({ variant, large }: { variant: string; large?: boolean }) {
  const [left, right] = fauxHeader(variant);
  return (
    <div className={["relative w-full bg-brand-subtle overflow-hidden", large ? "p-6" : "px-3.5 py-3"].join(" ")}>
      <div className="flex items-center justify-between">
        <span className={["font-semibold tracking-wide text-fg-secondary", large ? "text-[12px]" : "text-[9px]"].join(" ")}>
          {left}
        </span>
        <span className={["font-semibold tracking-wide text-fg-secondary", large ? "text-[12px]" : "text-[9px]"].join(" ")}>
          {right}
        </span>
      </div>
      <div className={["flex gap-3", large ? "mt-6" : "mt-3.5"].join(" ")}>
        <div className={["flex-1 flex flex-col pt-1", large ? "gap-3" : "gap-2"].join(" ")}>
          <div className={["rounded-sm bg-line-strong w-3/5", large ? "h-3" : "h-2"].join(" ")} />
          <div className={["rounded-sm bg-line w-2/5", large ? "h-3" : "h-2"].join(" ")} />
          <div className={["rounded-sm bg-line w-1/2", large ? "h-3" : "h-2"].join(" ")} />
          <div className={["rounded-sm bg-line-strong w-2/3", large ? "h-4 mt-3" : "h-2.5 mt-2"].join(" ")} />
          {large ? <div className="h-3 rounded-sm bg-line w-1/3 mt-1" /> : null}
        </div>
        <div className={["rounded bg-line-subtle border border-line shrink-0", large ? "w-24 h-28" : "w-14 h-16"].join(" ")} />
      </div>
      {/* faint authenticity stamp */}
      <div
        className={["absolute rounded-full border-2 border-brand/15", large ? "w-24 h-24 right-8 bottom-6" : "w-12 h-12 right-4 bottom-3"].join(" ")}
      />
    </div>
  );
}

// Tappable preview thumbnail used inside cards.
export function DocThumb({ label, onView }: { label: string; onView: () => void }) {
  const src = assetFor(label);
  return (
    <button
      type="button"
      onClick={onView}
      aria-label={`View ${label}`}
      className="relative w-full rounded-lg overflow-hidden border border-line-subtle block group"
    >
      {src ? (
        <img src={src} alt={label} className="w-full h-44 object-cover object-center bg-surface-sunken" />
      ) : (
        <FauxDoc variant={label} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
      <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-fg-primary/90 text-surface-card px-2.5 h-7 text-[12px] font-medium">
        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
        Tap to view
      </span>
    </button>
  );
}

// Full-size rendering shown inside the viewer.
export function DocFull({ label }: { label: string }) {
  const src = assetFor(label);
  if (src) return <img src={src} alt={label} className="w-full rounded-xl bg-surface-sunken" />;
  return (
    <div className="rounded-xl overflow-hidden border border-line-subtle">
      <FauxDoc variant={label} large />
    </div>
  );
}

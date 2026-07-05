import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, MapPin, RotateCcw, Loader2, Check, Search, Plus, X, ChevronRight, ShieldCheck, Trash2 } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

type PhotoStatus = "idle" | "capturing" | "done";

/* ---------- geotagged photo capture (controlled) ---------- */
function PhotoTile({ title, note, required, status, onCapture }: { title: string; note: string; required: boolean; status: PhotoStatus; onCapture: () => void }) {
  return (
    <div className="rounded-xl border border-line-subtle bg-surface-card p-3" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-start gap-2 mb-2.5">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-fg-primary">
              {title}
              {required ? <span className="text-neg"> *</span> : null}
            </span>
            {required ? null : <span className="text-[10px] font-bold tracking-[0.05em] text-fg-tertiary bg-surface-sunken rounded px-1.5 py-0.5">OPTIONAL</span>}
          </div>
          <span className="text-[12px] text-fg-tertiary mt-0.5">{note}</span>
        </div>
        {status === "done" ? <Check className="w-5 h-5 text-pos-fg shrink-0" strokeWidth={2.5} /> : null}
      </div>

      {status === "idle" ? (
        <button
          type="button"
          onClick={onCapture}
          className="w-full h-[120px] rounded-lg border-2 border-dashed border-line flex flex-col items-center justify-center gap-1.5 hover:border-brand hover:bg-surface-hover transition-colors"
        >
          <Camera className="w-6 h-6 text-fg-tertiary" strokeWidth={1.75} />
          <span className="text-[13px] font-semibold text-fg-primary">Capture photo</span>
          <span className="text-[11px] text-fg-tertiary">Camera only · auto-geotagged</span>
        </button>
      ) : status === "capturing" ? (
        <div className="w-full h-[120px] rounded-lg border border-line bg-surface-sunken flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-brand animate-spin" strokeWidth={2} />
          <span className="text-[13px] font-medium text-fg-secondary">Tagging location…</span>
        </div>
      ) : (
        <div className="anim-fade">
          <div className="w-full h-[120px] rounded-lg bg-gradient-to-br from-[#3a4a5a] to-[#1f2937] flex items-center justify-center relative overflow-hidden">
            <Camera className="w-7 h-7 text-white/40" strokeWidth={1.5} />
            <div className="absolute bottom-0 inset-x-0 bg-black/55 px-2.5 py-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-medium text-white/90 leading-tight">19.1136° N, 72.8697° E · 20 Jun, 2:14 AM</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCapture}
            className="mt-2 self-start inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-9 text-[13px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            Retake
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- two-option choice cards ---------- */
function Toggle<T extends string>({ value, options, onChange }: { value: T | null; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={[
              "flex items-center gap-2.5 h-12 px-3.5 rounded-xl border text-[14px] font-semibold transition-colors",
              active ? "border-brand bg-surface-selected text-fg-primary" : "border-line bg-surface-card text-fg-secondary hover:bg-surface-hover",
            ].join(" ")}
          >
            <span
              className={[
                "w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 transition-colors",
                active ? "border-brand bg-brand" : "border-line-strong",
              ].join(" ")}
            >
              {active ? <span className="w-1.5 h-1.5 rounded-full bg-white" /> : null}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type Mcc = { code: string; title: string };

const RECOMMENDED: Mcc = { code: "5131", title: "Wholesale of Piece Goods, Textiles & Notions" };
const SUGGESTIONS: Mcc[] = [
  { code: "5651", title: "Family Clothing Stores (Retail)" },
  { code: "5949", title: "Sewing, Needlework & Fabric Stores" },
];
const CATALOG: Mcc[] = [
  ...SUGGESTIONS,
  { code: "5621", title: "Women's Ready-to-Wear Stores" },
  { code: "5137", title: "Uniforms & Commercial Clothing" },
  { code: "5099", title: "Durable Goods, Miscellaneous" },
  { code: "5111", title: "Stationery & Office Supplies" },
  { code: "2741", title: "Miscellaneous Publishing & Printing" },
];

const PHOTOS = [
  { key: "nameboard", title: "Business nameboard", note: "Signage with the entity name visible", required: true },
  { key: "entrance", title: "Main entrance", note: "Shopfront or premises entry", required: true },
  { key: "inventory", title: "Inventory / stock", note: "Goods held on premises", required: true },
  { key: "owner", title: "Owner at premises", note: "Proprietor standing at the site", required: false },
];

export function SiteVerificationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const st = location.state as { partners?: string[]; directors?: string[]; signatory?: string } | null;
  const members = st?.directors ?? st?.partners ?? ["Ravi Kumar", "Rahul Mishra"];
  const flow = { entity, partners: members, directors: members, signatory: st?.signatory };

  const [sameAddress, setSameAddress] = useState<"yes" | "no" | null>(null);
  const [occupancy, setOccupancy] = useState<"rented" | "owned" | null>(null);

  const [photos, setPhotos] = useState<Record<string, PhotoStatus>>({ nameboard: "idle", entrance: "idle", inventory: "idle", owner: "idle" });
  const [verify, setVerify] = useState<"idle" | "verifying" | "done">("idle");

  const [selected, setSelected] = useState<Mcc[]>([RECOMMENDED]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const capture = (key: string) => {
    setPhotos((p) => ({ ...p, [key]: "capturing" }));
    setTimeout(() => setPhotos((p) => ({ ...p, [key]: "done" })), 900);
  };

  const photosDone = PHOTOS.filter((p) => p.required).every((p) => photos[p.key] === "done");
  const requiredDone = photosDone && sameAddress !== null && occupancy !== null;

  const initiate = () => {
    setVerify("verifying");
    setTimeout(() => {
      setVerify("done");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }, 1600);
  };

  const isSelected = (code: string) => selected.some((m) => m.code === code);
  const add = (m: Mcc) => {
    setSelected((p) => (p.some((x) => x.code === m.code) ? p : [...p, m]));
    setSearchOpen(false);
    setQuery("");
  };
  const remove = (code: string) => setSelected((p) => p.filter((m) => m.code !== code));

  const suggestionsToShow = SUGGESTIONS.filter((m) => !isSelected(m.code));
  const results = CATALOG.filter((m) => !isSelected(m.code) && (m.code.includes(query) || m.title.toLowerCase().includes(query.toLowerCase())));

  const canContinue = verify === "done" && selected.length > 0;

  return (
    <Screen
      header={<StepHeader step="STEP 6 OF 9" title="Site verification & MCC" progress={67} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          {verify === "done" ? (
            <Button full variant="dark" disabled={!canContinue} onClick={() => navigate("/account-setup", { state: flow })} rightIcon={<ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
              Confirm & continue
            </Button>
          ) : (
            <Button
              full
              variant="dark"
              disabled={!requiredDone || verify === "verifying"}
              onClick={initiate}
              leftIcon={verify === "verifying" ? <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2} /> : undefined}
            >
              {verify === "verifying" ? "Verifying location & classifying…" : "Initiate verification"}
            </Button>
          )}
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        {/* ---- Premises ---- */}
        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">PREMISES</span>
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold text-fg-primary leading-snug">
              Is the registered business address the same as the permanent address?<span className="text-neg"> *</span>
            </span>
            <Toggle
              value={sameAddress}
              onChange={setSameAddress}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold text-fg-primary leading-snug">
              Is the current place rented or owned?<span className="text-neg"> *</span>
            </span>
            <Toggle
              value={occupancy}
              onChange={setOccupancy}
              options={[
                { value: "rented", label: "Rented" },
                { value: "owned", label: "Owned" },
              ]}
            />
          </div>
        </div>

        {/* ---- Site photos ---- */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">SITE VERIFICATION PHOTOS</span>
          <div className="flex flex-col gap-3">
            {PHOTOS.map((p) => (
              <PhotoTile key={p.key} title={p.title} note={p.note} required={p.required} status={photos[p.key]} onCapture={() => capture(p.key)} />
            ))}
          </div>
        </div>

        {/* ---- Verification result + MCC ---- */}
        {verify === "done" ? (
          <div ref={resultRef} className="flex flex-col gap-5 anim-fade scroll-mt-6">
            {/* Address match */}
            <div className="rounded-xl border border-pos-border bg-surface-card overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-pos-bg border-b border-pos-border/40">
                <ShieldCheck className="w-5 h-5 text-pos-fg shrink-0" strokeWidth={2} />
                <span className="text-[14px] font-bold text-pos-fg">Location verified · within 500 m</span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-medium text-fg-tertiary">Extracted address (from documents)</span>
                  <span className="text-[13px] font-semibold text-fg-primary leading-snug">Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-medium text-fg-tertiary">Live tagged location (site photos)</span>
                  <span className="text-[13px] font-semibold text-fg-primary leading-snug">19.1136° N, 72.8697° E · Andheri East, Mumbai</span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-pos-fg shrink-0" strokeWidth={2} />
                  <span className="text-[12px] font-medium text-pos-fg">Captured ~180 m from the registered address</span>
                </div>
              </div>
            </div>

            {/* MCC */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">
                  MERCHANT CATEGORY (MCC)<span className="text-neg"> *</span>
                </span>
                <span className="text-[13px] text-fg-secondary">Select the MCC that best matches the business activity.</span>
              </div>

              {selected.map((m) => (
                <div key={m.code} className="rounded-xl border border-line bg-surface-card p-4 flex items-start gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight text-fg-primary leading-tight">{m.code}</span>
                    <span className="text-[13px] text-fg-secondary mt-0.5 leading-snug">{m.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(m.code)}
                    aria-label={`Remove MCC ${m.code}`}
                    className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-fg-tertiary hover:text-neg hover:border-neg/40 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ))}

              {searchOpen ? (
                <div className="rounded-xl border border-line bg-surface-card p-3 flex flex-col gap-2 anim-fade">
                  <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-line bg-surface-card focus-within:border-brand transition-colors">
                    <Search className="w-4 h-4 text-fg-tertiary shrink-0" strokeWidth={2} />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by MCC code or category"
                      className="flex-1 bg-transparent text-[14px] text-fg-primary placeholder:text-fg-tertiary"
                    />
                    <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-fg-tertiary">
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>

                  {!query && suggestionsToShow.length ? (
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold tracking-[0.06em] text-fg-tertiary px-1 pt-1 pb-0.5">SUGGESTED BY ENGINE</span>
                      {suggestionsToShow.map((m) => (
                        <button key={m.code} type="button" onClick={() => add(m)} className="flex items-center gap-2 py-2.5 px-1 text-left hover:bg-surface-hover rounded-md transition-colors">
                          <span className="text-[13px] font-semibold text-fg-primary">{m.code}</span>
                          <span className="text-[13px] text-fg-secondary truncate">{m.title}</span>
                          <Plus className="w-4 h-4 text-brand ml-auto shrink-0" strokeWidth={2} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {results.length ? (
                        results.map((m) => (
                          <button key={m.code} type="button" onClick={() => add(m)} className="flex items-center gap-2 py-2.5 px-1 text-left hover:bg-surface-hover rounded-md transition-colors">
                            <span className="text-[13px] font-semibold text-fg-primary">{m.code}</span>
                            <span className="text-[13px] text-fg-secondary truncate">{m.title}</span>
                            <Plus className="w-4 h-4 text-brand ml-auto shrink-0" strokeWidth={2} />
                          </button>
                        ))
                      ) : (
                        <span className="text-[13px] text-fg-tertiary py-2.5 px-1">No matching MCC found.</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="self-start inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-card px-3.5 h-11 text-[14px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add MCC
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
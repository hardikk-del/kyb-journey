import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Trash2, Check, Info, ChevronRight, ShieldCheck, UserCheck } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";
import { membersInfoFor, type MemberInfo } from "../lib/entities";

type Holder = { id: number; name: string; type: "Individual" | "Body Corporate"; pct: string };

const HOLDER_TYPES = ["Individual", "Body Corporate"] as const;

// A director/individual is a UBO when they hold more than 25%.
const UBO_THRESHOLD = 25;

function Req() {
  return <span className="text-neg"> *</span>;
}

function SectionCard({ index, title, hint, required, children }: { index: number; title: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line-subtle bg-surface-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-start gap-3 pb-3">
        <span className="w-6 h-6 rounded-full bg-fg-primary text-surface-card flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">{index}</span>
        <div className="flex flex-col">
          <span className="text-[16px] font-bold tracking-tight text-fg-primary leading-tight">{title}{required ? <Req /> : null}</span>
          {hint ? <span className="text-[13px] text-fg-tertiary mt-0.5">{hint}</span> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function ShareholdingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { entity?: string; directors?: string[]; signatory?: string } | null;
  const entity = state?.entity ?? "ltd";
  const directors = state?.directors ?? [];
  const info = membersInfoFor(entity);
  const infoFor = (name: string): MemberInfo | undefined => info.find((m) => m.name === name);

  const [holders, setHolders] = useState<Holder[]>([
    { id: 0, name: "Ravi Kumar", type: "Individual", pct: "40" },
    { id: 1, name: "Rahul Mishra", type: "Individual", pct: "35" },
    { id: 2, name: "Anjali Sharma", type: "Individual", pct: "15" },
    { id: 3, name: "Finramp Holdings LLP", type: "Body Corporate", pct: "10" },
  ]);
  const [seniorOfficial, setSeniorOfficial] = useState("");
  const [declared, setDeclared] = useState(true);

  const total = holders.reduce((sum, h) => sum + (Number(h.pct) || 0), 0);
  const totalOk = total === 100;

  const ubos = holders.filter((h) => h.type === "Individual" && (Number(h.pct) || 0) > UBO_THRESHOLD);
  const hasUbo = ubos.length > 0;

  const setHolder = (id: number, patch: Partial<Holder>) =>
    setHolders((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const addHolder = () =>
    setHolders((prev) => [...prev, { id: (prev[prev.length - 1]?.id ?? 0) + 1, name: "", type: "Individual", pct: "" }]);
  const removeHolder = (id: number) => setHolders((prev) => prev.filter((h) => h.id !== id));

  // If nobody crosses 25%, PMLA requires naming the senior managing official.
  const complete = totalOk && declared && (hasUbo || seniorOfficial !== "");

  return (
    <Screen
      header={<StepHeader step="STEP 3.5 OF 9" title="Shareholding & UBO" progress={40} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          {!totalOk ? (
            <p className="text-center text-[13px] text-warning-fg font-medium mb-2.5">
              Shareholding must total 100% (currently {total}%)
            </p>
          ) : null}
          <Button
            full
            variant="dark"
            disabled={!complete}
            onClick={() => navigate("/self-declaration", { state: { entity, directors, signatory: state?.signatory } })}
            rightIcon={<ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />}
          >
            Confirm &amp; continue
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-5">
        <p className="text-[14px] text-fg-secondary leading-relaxed -mt-1">
          Declare the company's shareholding pattern. Individuals holding more than {UBO_THRESHOLD}% are
          flagged as Ultimate Beneficial Owners.
        </p>

        {/* 1 — Shareholding pattern */}
        <SectionCard index={1} title="Shareholding pattern" hint="Must total 100%" required>
          <div className="flex flex-col gap-3">
            {holders.map((h) => (
              <div key={h.id} className="rounded-lg border border-line-subtle bg-surface-sunken p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold tracking-[0.06em] text-fg-tertiary">SHAREHOLDER</span>
                  {holders.length > 1 ? (
                    <button type="button" onClick={() => removeHolder(h.id)} aria-label="Remove shareholder" className="text-neg">
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  ) : null}
                </div>
                <input
                  value={h.name}
                  onChange={(e) => setHolder(h.id, { name: e.target.value })}
                  placeholder="Shareholder name"
                  className="h-11 px-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Dropdown value={h.type} options={[...HOLDER_TYPES]} onChange={(v) => setHolder(h.id, { type: v as Holder["type"] })} />
                  <div className="flex items-center h-11 px-3 rounded-lg border border-line bg-surface-card focus-within:border-brand transition-colors">
                    <input
                      value={h.pct}
                      onChange={(e) => setHolder(h.id, { pct: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                      inputMode="numeric"
                      placeholder="0"
                      className="flex-1 bg-transparent text-[14px] text-fg-primary placeholder:text-fg-tertiary outline-none w-full"
                    />
                    <span className="text-[14px] font-semibold text-fg-tertiary">%</span>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addHolder}
              className="self-start inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-9 text-[13px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add shareholder
            </button>

            <div className={["flex items-center justify-between rounded-lg px-3.5 h-11 mt-1", totalOk ? "bg-pos-bg" : "bg-warning/10"].join(" ")}>
              <span className={["text-[13px] font-semibold", totalOk ? "text-pos-fg" : "text-warning-fg"].join(" ")}>Total holding</span>
              <span className={["text-[15px] font-bold", totalOk ? "text-pos-fg" : "text-warning-fg"].join(" ")}>{total}%</span>
            </div>
          </div>
        </SectionCard>

        {/* 2 — Ultimate Beneficial Owners (auto-derived) */}
        <SectionCard index={2} title="Ultimate Beneficial Owners" hint={`Individuals holding > ${UBO_THRESHOLD}%`} required>
          {hasUbo ? (
            <div className="flex flex-col gap-3">
              {ubos.map((u) => {
                const d = infoFor(u.name);
                return (
                  <div key={u.id} className="rounded-lg border border-brand/20 bg-surface-selected p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-fg-primary">
                        <ShieldCheck className="w-4 h-4 text-brand" strokeWidth={2} />
                        {u.name}
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.04em] text-brand bg-brand-subtle rounded px-2 py-0.5">
                        UBO · {u.pct}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] text-fg-tertiary">PAN</span>
                      <span className="text-[13.5px] font-semibold text-fg-primary">{d?.pan ?? "—"}</span>
                    </div>
                    {d?.address ? (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[13px] text-fg-tertiary shrink-0">Address</span>
                        <span className="text-[13px] font-medium text-fg-primary text-right leading-snug">{d.address}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <div className="flex items-start gap-2 rounded-lg bg-surface-sunken px-3 py-2.5">
                <Info className="w-4 h-4 text-fg-tertiary mt-0.5 shrink-0" strokeWidth={2} />
                <span className="text-[13px] text-fg-tertiary leading-snug">
                  {ubos.length} beneficial owner{ubos.length > 1 ? "s" : ""} identified from the shareholding above.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 rounded-lg bg-surface-sunken px-3 py-2.5">
                <Info className="w-4 h-4 text-fg-tertiary mt-0.5 shrink-0" strokeWidth={2} />
                <span className="text-[13px] text-fg-tertiary leading-snug">
                  No individual holds more than {UBO_THRESHOLD}%. Under PMLA, name the senior managing official
                  who exercises control.
                </span>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-fg-secondary">Senior managing official<Req /></span>
                <Dropdown value={seniorOfficial} options={directors} onChange={setSeniorOfficial} placeholder="Select a director" />
              </label>
            </div>
          )}
        </SectionCard>

        {/* Declaration */}
        <button type="button" onClick={() => setDeclared((p) => !p)} className="flex items-start gap-3 text-left px-1">
          <span className={["w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors", declared ? "bg-brand border-brand" : "border-line-strong"].join(" ")}>
            {declared ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-fg-secondary leading-snug">
            <UserCheck className="w-4 h-4 text-fg-tertiary shrink-0" strokeWidth={2} />
            The shareholding and beneficial-ownership details above are true and complete.
          </span>
        </button>
      </div>
    </Screen>
  );
}

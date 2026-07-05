import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Flag, ChevronRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { Dropdown } from "../components/Dropdown";
import { ENTITY_META, membersFor } from "../lib/entities";

/* ---------- shared section shell (mirrors SelfDeclaration) ---------- */
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

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <span className="text-[13px] font-semibold text-fg-secondary">{children}{required ? <Req /> : null}</span>;
}

const turnoverBands = ["₹0–5 L", "₹5–10 L", "₹10–50 L", "₹50 L–1 Cr", "₹1–10 Cr", "₹10–50 Cr", "₹50–100 Cr", "> ₹100 Cr"];
const natures = ["Manufacturer", "Trader / Wholesaler", "Retailer", "Service provider", "Others"];
const fundSources = ["Business income", "Donation", "Grant", "From group company", "Equity investment", "Other"];

export function BusinessDetailsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const isLlp = entity === "llp";
  const isLtd = entity === "ltd";
  const isCorporate = isLlp || isLtd;
  // LLP threads `partners`; company threads `directors` — both list the members.
  const stateMembers = (location.state as { partners?: string[]; directors?: string[] } | null);
  const members = stateMembers?.directors ?? stateMembers?.partners ?? membersFor(entity);
  const partners = members;
  const signatory = (location.state as { signatory?: string } | null)?.signatory;

  const [turnover, setTurnover] = useState("");
  const [channel, setChannel] = useState<"online" | "offline" | "both" | null>(null);
  const [nature, setNature] = useState("");
  const [funds, setFunds] = useState("");

  const complete = turnover && channel && nature && funds;

  const entityName = ENTITY_META[entity as keyof typeof ENTITY_META]?.legalName ?? "Mehta Textiles Pvt Ltd";
  const memberNoun = ENTITY_META[entity as keyof typeof ENTITY_META]?.memberNoun ?? "Members";

  // Non-partner fetched fields, common to both entity types
  const baseFields: { label: string; value: string }[] = [
    { label: "Entity name", value: entityName },
    { label: "Date of incorporation", value: "14 Mar 2016" },
    { label: "Registered address", value: "Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059" },
  ];

  return (
    <Screen
      header={<StepHeader step="STEP 5 OF 9" title="Business details" progress={56} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button full variant="dark" disabled={!complete} onClick={() => navigate("/site-verification", { state: { entity, partners, directors: members, signatory } })} rightIcon={<ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Continue to verification
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-5">
        {/* Auto-fetched entity card */}
        <div className="rounded-xl border border-pos-border bg-surface-card overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line-subtle bg-pos-bg">
            <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-pos-fg" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[14px] font-bold text-fg-primary leading-tight">Entity details</span>
            </div>
            <StatusBadge kind="verified" />
          </div>

          <div className="px-4 py-1">
            {isCorporate ? (
              <div className="flex flex-col gap-0.5 py-3 border-b border-line-subtle">
                <span className="text-[12px] font-medium text-fg-tertiary">{memberNoun}</span>
                <div className="flex flex-col gap-1 mt-1">
                  {members.map((p, i) => (
                    <span key={p} className="text-[14px] font-semibold text-fg-primary leading-snug">
                      {i + 1}. {p}
                      {isLtd && p === signatory ? <span className="text-[12px] font-medium text-brand"> · Authorised signatory</span> : null}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 py-3 border-b border-line-subtle">
                <span className="text-[12px] font-medium text-fg-tertiary">Proprietor name</span>
                <span className="text-[14px] font-semibold text-fg-primary leading-snug">Rahul Mehta</span>
              </div>
            )}

            {baseFields.map((f, i) => (
              <div key={f.label} className={["flex flex-col gap-0.5 py-3", i === baseFields.length - 1 ? "" : "border-b border-line-subtle"].join(" ")}>
                <span className="text-[12px] font-medium text-fg-tertiary">{f.label}</span>
                <span className="text-[14px] font-semibold text-fg-primary leading-snug">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end px-4 py-2.5 border-t border-line-subtle">
            <button type="button" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg-tertiary hover:text-fg-primary transition-colors">
              <Flag className="w-3.5 h-3.5" strokeWidth={2} />
              Report mismatch
            </button>
          </div>
        </div>

        {/* 1 — Turnover */}
        <SectionCard index={1} title="Annual turnover" hint="Latest financial year" required>
          <Dropdown value={turnover} options={turnoverBands} onChange={setTurnover} placeholder="Select turnover band" />
        </SectionCard>

        {/* 2 — Business activity (feeds MCC classifier) */}
        <SectionCard index={2} title="What the business does" required>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <FieldLabel required>What does the business sell or provide?</FieldLabel>
              <textarea
                placeholder="e.g. Wholesale cotton fabric and finished garments to apparel brands"
                className="w-full min-h-[72px] p-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors resize-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <FieldLabel required>Who are the customers?</FieldLabel>
              <input
                placeholder="e.g. Apparel brands and garment manufacturers"
                className="h-11 px-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors"
              />
            </label>

            <div className="flex flex-col gap-2">
              <FieldLabel required>Sales channel</FieldLabel>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-sunken">
                {(["online", "offline", "both"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={["h-11 rounded-lg text-[14px] font-semibold capitalize transition-colors", channel === c ? "bg-surface-card text-fg-primary" : "text-fg-tertiary"].join(" ")}
                    style={channel === c ? { boxShadow: "var(--shadow-xs)" } : undefined}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <FieldLabel>Primary revenue line</FieldLabel>
              <input
                placeholder="e.g. Fabric wholesale (≈70% of revenue)"
                className="h-11 px-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors"
              />
            </label>
          </div>
        </SectionCard>

        {/* 3 — Nature of business */}
        <SectionCard index={3} title="Nature of business" required>
          <div className="flex flex-col gap-2.5">
            <Dropdown value={nature} options={natures} onChange={setNature} placeholder="Select nature of business" />
            {nature === "Others" ? (
              <input
                placeholder="Specify nature of business"
                className="h-11 px-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors anim-fade"
              />
            ) : null}
          </div>
        </SectionCard>

        {/* 4 — Source of funds */}
        <SectionCard index={4} title="Source of funds" required>
          <div className="flex flex-col gap-2.5">
            <Dropdown value={funds} options={fundSources} onChange={setFunds} placeholder="Select source of funds" />
            {funds === "Other" ? (
              <input
                placeholder="Specify other source of funds"
                className="h-11 px-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors anim-fade"
              />
            ) : null}
          </div>
        </SectionCard>
      </div>
    </Screen>
  );
}
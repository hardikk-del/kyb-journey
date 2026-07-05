import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Plus, Trash2, Check, Info, ChevronRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";

type YN = "yes" | "no";

/* ---------- form primitives ---------- */

function YesNo({ value, onChange, invert }: { value: YN | null; onChange: (v: YN) => void; invert?: boolean }) {
  // invert=true → "Yes" sits left (used where Yes is the simplifying answer)
  const order: YN[] = invert ? ["yes", "no"] : ["no", "yes"];
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-sunken w-[132px] shrink-0">
      {order.map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={[
              "h-9 rounded-md text-[14px] font-semibold capitalize transition-colors",
              active ? "bg-surface-card text-fg-primary" : "text-fg-tertiary",
            ].join(" ")}
            style={active ? { boxShadow: "var(--shadow-xs)" } : undefined}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

function QRow({ title, sub, value, onChange, invert, last }: { title: string; sub?: string; value: YN | null; onChange: (v: YN) => void; invert?: boolean; last?: boolean }) {
  return (
    <div className={["flex items-center gap-3 py-3.5", last ? "" : "border-b border-line-subtle"].join(" ")}>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[15px] font-semibold text-fg-primary leading-snug">{title}</span>
        {sub ? <span className="text-[13px] text-fg-tertiary mt-0.5">{sub}</span> : null}
      </div>
      <YesNo value={value} onChange={onChange} invert={invert} />
    </div>
  );
}

function Field({ label, placeholder, wide }: { label: string; placeholder: string; wide?: boolean }) {
  return (
    <label className={["flex flex-col gap-1.5", wide ? "col-span-2" : ""].join(" ")}>
      <span className="text-[13px] font-medium text-fg-secondary">{label}</span>
      <input
        placeholder={placeholder}
        className="h-11 px-3 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors"
      />
    </label>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 pl-3 border-l-2 border-brand-subtle flex flex-col gap-3 anim-fade">{children}</div>;
}

function SectionCard({ index, title, hint, required, children }: { index: number; title: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line-subtle bg-surface-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-start gap-3 pb-1">
        <span className="w-6 h-6 rounded-full bg-fg-primary text-surface-card flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">{index}</span>
        <div className="flex flex-col">
          <span className="text-[16px] font-bold tracking-tight text-fg-primary leading-tight">{title}{required ? <span className="text-neg"> *</span> : null}</span>
          {hint ? <span className="text-[13px] text-fg-tertiary mt-0.5">{hint}</span> : null}
        </div>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-3 py-2.5 text-left w-full">
      <span
        className={[
          "w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 transition-colors",
          checked ? "bg-brand border-brand" : "border-line-strong",
        ].join(" ")}
      >
        {checked ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
      </span>
      <span className="text-[14px] text-fg-primary leading-snug">{label}</span>
    </button>
  );
}

function Radio({ label, sub, checked, onSelect }: { label: string; sub?: string; checked: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex items-center gap-3 p-3.5 rounded-lg border text-left transition-colors",
        checked ? "border-brand bg-surface-selected" : "border-line bg-surface-card hover:bg-surface-hover",
      ].join(" ")}
    >
      <span className={["w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0", checked ? "border-brand" : "border-line-strong"].join(" ")}>
        {checked ? <span className="w-2.5 h-2.5 rounded-full bg-brand" /> : null}
      </span>
      <div className="flex flex-col">
        <span className={["text-[15px] font-semibold", checked ? "text-brand" : "text-fg-primary"].join(" ")}>{label}</span>
        {sub ? <span className="text-[13px] text-fg-tertiary mt-0.5">{sub}</span> : null}
      </div>
    </button>
  );
}

const nfeCategories = [
  "Corporation regularly traded on a securities market",
  "Related entity of such a corporation",
  "Governmental Entity",
  "International Organisation",
  "Central Bank",
  "Financial Institution",
];

/* ---------- screen ---------- */

export function SelfDeclarationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const st = location.state as { partners?: string[]; directors?: string[]; signatory?: string } | null;
  const members = st?.directors ?? st?.partners ?? ["Ravi Kumar", "Rahul Mishra"];
  // Carried forward on every navigation so downstream corporate screens keep context.
  const flow = { entity, partners: members, directors: members, signatory: st?.signatory };

  // FATCA / CRS
  const [indiaOnly, setIndiaOnly] = useState<YN>("yes");
  const [usResident, setUsResident] = useState<YN | null>(null);
  const [usPerson, setUsPerson] = useState<YN | null>(null);
  const [specifiedUs, setSpecifiedUs] = useState<YN | null>(null);
  const [otherResident, setOtherResident] = useState<YN | null>(null);
  const [cats, setCats] = useState<boolean[]>(Array(nfeCategories.length).fill(false));
  const [noTaxRes, setNoTaxRes] = useState<YN | null>(null);
  const [multiRes, setMultiRes] = useState<YN | null>(null);
  const [residencies, setResidencies] = useState<number[]>([0]);

  // Credit exposure
  const [exposure, setExposure] = useState<"lt5" | "ge5" | "exempt">("lt5");

  // FI / NFE
  const [fiNfe, setFiNfe] = useState<"fi" | "nfe">("nfe");
  const [nfeType, setNfeType] = useState<"active" | "passive">("active");

  const [authorised, setAuthorised] = useState(true);
  const [bureauConsent, setBureauConsent] = useState(true);

  const fatcaExpanded = indiaOnly === "no";
  const anyCat = cats.some(Boolean);
  const fatcaAnswered = usResident !== null && otherResident !== null && noTaxRes !== null && multiRes !== null;
  const contradiction =
    fatcaAnswered && usResident === "no" && otherResident === "no" && noTaxRes === "no" && multiRes === "no";
  const fatcaComplete = indiaOnly === "yes" || (fatcaAnswered && !contradiction);

  return (
    <Screen
      header={<StepHeader step="STEP 4 OF 9" title="Self-declaration" progress={44} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button full variant="dark" disabled={!authorised || !bureauConsent || !fatcaComplete} onClick={() => navigate("/business-details", { state: flow })} rightIcon={<ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Run verification
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-5">
        {/* 1 — FATCA / CRS */}
        <SectionCard index={1} title="FATCA / CRS" hint="Tax residency declaration" required>
          <QRow
            title="Tax resident of India only?"
            sub="Not a tax resident of any country outside India"
            value={indiaOnly}
            onChange={setIndiaOnly}
            invert
            last
          />

          {fatcaExpanded ? (
            <div className="mt-2 anim-fade flex flex-col gap-3">
              <div
                className={[
                  "rounded-lg px-3 py-2.5 flex items-start gap-2 border",
                  contradiction ? "border-neg bg-surface-card" : "border-transparent bg-surface-sunken",
                ].join(" ")}
              >
                <Info className={["w-4 h-4 mt-0.5 shrink-0", contradiction ? "text-neg" : "text-fg-tertiary"].join(" ")} strokeWidth={2} />
                <span className={["text-[13px] leading-snug", contradiction ? "text-neg" : "text-fg-tertiary"].join(" ")}>
                  {contradiction
                    ? "Entity is not India-only — at least one residency outside India must be answered Yes."
                    : "Entity is not India-only. Answer each question to declare residencies outside India."}
                </span>
              </div>
              <div className="flex flex-col divide-y divide-line-subtle">
              {/* US */}
              <div className="py-3.5">
                <QRow title="Tax resident of the US?" value={usResident} onChange={setUsResident} last />
                {usResident === "yes" ? (
                  <Reveal>
                    <Field label="US TIN" placeholder="Enter US Taxpayer ID Number" wide />
                    <QRow title="Is the entity a US Person?" value={usPerson} onChange={setUsPerson} last />
                    <QRow title="Is it a Specified US Person?" sub="If yes, entity is US Reportable" value={specifiedUs} onChange={setSpecifiedUs} last />
                  </Reveal>
                ) : null}
              </div>

              {/* Other than US */}
              <div className="py-3.5">
                <QRow title="Tax resident outside India (other than US)?" value={otherResident} onChange={setOtherResident} last />
                {otherResident === "yes" ? (
                  <Reveal>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Country code" placeholder="e.g. AE" />
                      <Field label="TIN / equivalent" placeholder="Tax ID" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-fg-secondary mb-1">Entity category</span>
                      {nfeCategories.map((c, i) => (
                        <CheckRow
                          key={c}
                          label={c}
                          checked={cats[i]}
                          onToggle={() => setCats((p) => p.map((v, idx) => (idx === i ? !v : v)))}
                        />
                      ))}
                      {!anyCat ? (
                        <div className="mt-1 rounded-lg bg-surface-sunken px-3 py-2.5 flex items-start gap-2">
                          <Info className="w-4 h-4 text-fg-tertiary mt-0.5 shrink-0" strokeWidth={2} />
                          <span className="text-[13px] text-fg-tertiary leading-snug">If none apply, the account is classified as an "Other Reportable Account".</span>
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                ) : null}
              </div>

              {/* No residence for tax */}
              <div className="py-3.5">
                <QRow title="No residence for tax purposes?" value={noTaxRes} onChange={setNoTaxRes} last />
                {noTaxRes === "yes" ? (
                  <Reveal>
                    <Field label="Country code of principal office" placeholder="e.g. SG" />
                  </Reveal>
                ) : null}
              </div>

              {/* Multiple residencies */}
              <div className="py-3.5">
                <QRow title="Multiple tax residencies?" value={multiRes} onChange={setMultiRes} last />
                {multiRes === "yes" ? (
                  <Reveal>
                    {residencies.map((id, idx) => (
                      <div key={id} className="rounded-lg border border-line-subtle bg-surface-sunken p-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold tracking-[0.06em] text-fg-tertiary">RESIDENCY {idx + 1}</span>
                          {residencies.length > 1 ? (
                            <button type="button" onClick={() => setResidencies((p) => p.filter((x) => x !== id))} aria-label="Remove" className="text-neg">
                              <Trash2 className="w-4 h-4" strokeWidth={2} />
                            </button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Country of tax residence" placeholder="Country" />
                          <Field label="TIN / equivalent" placeholder="Tax ID" />
                        </div>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-[13px] font-medium text-fg-secondary">Identification type</span>
                          <Dropdown value="TIN" options={["TIN", "CIN", "EIN", "Other"]} onChange={() => {}} />
                        </label>
                        <Field label="Address" placeholder="Registered address" wide />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setResidencies((p) => [...p, (p[p.length - 1] ?? 0) + 1])}
                      className="self-start inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-9 text-[13px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      Add residency
                    </button>
                  </Reveal>
                ) : null}
              </div>
              </div>
            </div>
          ) : null}
        </SectionCard>

        {/* 2 — Credit exposure */}
        <SectionCard index={2} title="Credit exposure" hint="Total exposure across the banking system" required>
          <div className="flex flex-col gap-2.5 pt-1">
            <Radio label="Less than ₹5 Crores" checked={exposure === "lt5"} onSelect={() => setExposure("lt5")} />
            <Radio label="₹5 Crores or more" checked={exposure === "ge5"} onSelect={() => setExposure("ge5")} />
            <Radio label="Exempted category" checked={exposure === "exempt"} onSelect={() => setExposure("exempt")} />
          </div>
          {exposure === "lt5" ? (
            <div className="mt-3 rounded-lg bg-surface-sunken px-3.5 py-3">
              <span className="text-[11px] font-semibold tracking-[0.06em] text-fg-tertiary">UNDERTAKING</span>
              <p className="text-[12.5px] text-fg-secondary leading-relaxed mt-1.5">
                I/We declare that our total credit exposure with all Banks is less than ₹5.00 crores. I/We undertake to inform the Bank immediately of any
                change to our CC/OD/credit facilities, or when total facilities reach ₹5.00 crores or more, to provide documents required under RBI
                regulations, and to close the Current Account as and when demanded by the Bank.
              </p>
            </div>
          ) : null}
        </SectionCard>

        {/* 3 — FI / NFE classification */}
        <SectionCard index={3} title="FI / NFE classification" hint="Financial vs non-financial entity" required>
          <div className="flex flex-col gap-2.5 pt-1">
            <Radio label="Financial Institution (FI)" sub="Banks, insurance, NBFCs, etc." checked={fiNfe === "fi"} onSelect={() => setFiNfe("fi")} />
            <Radio label="Non-Financial Entity (NFE)" checked={fiNfe === "nfe"} onSelect={() => setFiNfe("nfe")} />
          </div>
          {fiNfe === "nfe" ? (
            <Reveal>
              <span className="text-[13px] font-medium text-fg-secondary">Is the entity an Active or Passive NFE?</span>
              <div className="grid grid-cols-2 gap-2.5">
                <Radio label="Active NFE" checked={nfeType === "active"} onSelect={() => setNfeType("active")} />
                <Radio label="Passive NFE" checked={nfeType === "passive"} onSelect={() => setNfeType("passive")} />
              </div>
              {nfeType === "passive" ? (
                <div className="rounded-lg bg-surface-sunken px-3 py-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-fg-tertiary mt-0.5 shrink-0" strokeWidth={2} />
                  <span className="text-[13px] text-fg-tertiary leading-snug">Declare the number of Controlling Persons and complete their details in the next section.</span>
                </div>
              ) : null}
            </Reveal>
          ) : null}
        </SectionCard>

        {/* Authorisation */}
        <div className="flex flex-col gap-3.5">
          <button type="button" onClick={() => setAuthorised((p) => !p)} className="flex items-start gap-3 text-left px-1">
            <span className={["w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors", authorised ? "bg-brand border-brand" : "border-line-strong"].join(" ")}>
              {authorised ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
            </span>
            <span className="text-[13px] text-fg-secondary leading-snug">
              Customer declares the above is true and authorises the bank to verify with tax authorities and the banking system.
            </span>
          </button>
          <button type="button" onClick={() => setBureauConsent((p) => !p)} className="flex items-start gap-3 text-left px-1">
            <span className={["w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors", bureauConsent ? "bg-brand border-brand" : "border-line-strong"].join(" ")}>
              {bureauConsent ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
            </span>
            <span className="text-[13px] text-fg-secondary leading-snug">
              Customer consents to the bank fetching credit information from credit bureaus to assess total credit exposure, evaluate risk, and recommend eligible banking products.
            </span>
          </button>
        </div>
      </div>
    </Screen>
  );
}
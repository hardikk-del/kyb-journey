import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2, BadgeCheck, Landmark } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";
import { ENTITY_META, isCorporateEntity } from "../lib/entities";

function Req() {
  return <span className="text-neg"> *</span>;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-[13px] font-semibold text-fg-secondary">
      {children}
      {required ? <Req /> : null}
    </span>
  );
}

const HAS_CIN: Record<string, boolean> = { ltd: true, llp: true };

// Indian States (28) + Union Territories (8) with GST state codes.
const STATES: { name: string; code: string }[] = [
  { name: "Andhra Pradesh", code: "37" }, { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" }, { name: "Bihar", code: "10" }, { name: "Chhattisgarh", code: "22" },
  { name: "Goa", code: "30" }, { name: "Gujarat", code: "24" }, { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" }, { name: "Jharkhand", code: "20" }, { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" }, { name: "Madhya Pradesh", code: "23" }, { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" }, { name: "Meghalaya", code: "17" }, { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" }, { name: "Odisha", code: "21" }, { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" }, { name: "Sikkim", code: "11" }, { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" }, { name: "Tripura", code: "16" }, { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" }, { name: "West Bengal", code: "19" },
  // Union Territories
  { name: "Andaman & Nicobar Islands", code: "35" }, { name: "Chandigarh", code: "04" },
  { name: "Dadra & Nagar Haveli and Daman & Diu", code: "26" }, { name: "Delhi", code: "07" },
  { name: "Jammu & Kashmir", code: "01" }, { name: "Ladakh", code: "38" },
  { name: "Lakshadweep", code: "31" }, { name: "Puducherry", code: "34" },
];

export function EntityDetailsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "ltd";
  const isLlp = entity === "llp";
  const isCorporate = isCorporateEntity(entity);
  const meta = ENTITY_META[entity as keyof typeof ENTITY_META];
  const members = meta?.members ?? ["Ravi Kumar", "Rahul Mishra"];
  const memberNoun = meta?.memberNoun ?? "Designated Partners";

  const [pan, setPan] = useState("");
  const [state, setState] = useState("");
  const [stage, setStage] = useState<"input" | "verifying" | "verified">("input");

  const panStr = pan;
  const panFilled = pan.length === 10;
  const panLocked = stage === "verifying" || stage === "verified";
  const stateCode = STATES.find((s) => s.name === state)?.code ?? "29";
  const gstin = `${stateCode}${panStr}1ZO`;
  const cin = "U62013KA2023PTC181035";

  // Contextual verified legal name mapping based on active route state
  const verifiedName = meta?.legalName ?? "Finramp Technologies Pvt Ltd";

  const runVerify = () => {
    setStage("verifying");
    setTimeout(() => setStage("verified"), 1600);
  };

  const verified = stage === "verified";

  return (
    <Screen
      header={<StepHeader step="STEP 1 OF 9" title="Business details" progress={15} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          {verified ? (
            <Button
              full
              variant="dark"
              onClick={() => {
                if (isLlp) {
                  navigate("/partner-contacts", {
                    state: { entity: "llp", partners: members },
                  });
                } else if (entity === "ltd") {
                  // Company flow: collect each director's KYC (manual / link)
                  // before the corporate-document checklist. Carry the fetched
                  // directors + the designated authorised signatory forward.
                  navigate("/director-kyc", {
                    state: { entity, directors: members, signatory: members[0] },
                  });
                } else {
                  navigate("/checklist", { state: { entity } });
                }
              }}
              rightIcon={<ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}
            >
              Next
            </Button>
          ) : (
            <Button
              full
              variant="dark"
              disabled={!panFilled || !state || stage === "verifying"}
              onClick={runVerify}
              leftIcon={stage === "verifying" ? <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2} /> : undefined}
            >
              {stage === "verifying" ? (isCorporate ? "Fetching MCA Records…" : "Verifying PAN…") : "Verify PAN"}
            </Button>
          )}
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-6">
        <p className="text-[14px] text-fg-secondary leading-relaxed -mt-1">
          Enter the entity details as per the business PAN.
        </p>

        {/* Business PAN */}
        <label className="flex flex-col gap-2">
          <FieldLabel required>Business PAN</FieldLabel>
          <input
            value={pan}
            readOnly={panLocked}
            inputMode="text"
            maxLength={10}
            placeholder="ABCDE1234F"
            onChange={(e) => setPan(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10))}
            className={[
              "h-12 px-3.5 rounded-lg border text-[16px] font-semibold tracking-[0.14em] uppercase placeholder:text-fg-tertiary placeholder:tracking-[0.14em] placeholder:font-normal transition-colors focus:outline-none",
              panLocked
                ? "border-line-subtle bg-surface-sunken text-fg-secondary cursor-default"
                : "border-line bg-surface-card text-fg-primary focus:border-brand",
            ].join(" ")}
          />
        </label>

        {/* State / UT */}
        <div className="flex flex-col gap-2">
          <FieldLabel required>State / UT to open current account</FieldLabel>
          <Dropdown value={state} options={STATES.map((s) => s.name)} onChange={setState} placeholder="Select State / UT" disabled={verified || stage === "verifying"} />
          <span className="text-[12.5px] text-fg-tertiary leading-snug">
            The current account will be opened against the GSTIN registered in this State / UT.
          </span>
        </div>

        {/* Verifying animation */}
        {stage === "verifying" ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-line bg-surface-card py-9 anim-fade" style={{ boxShadow: "var(--shadow-xs)" }}>
            <span className="relative flex items-center justify-center w-12 h-12">
              <span className="absolute inset-0 rounded-full border-2 border-line" />
              <Loader2 className="w-12 h-12 text-brand animate-spin" strokeWidth={1.75} />
            </span>
            <span className="text-[14px] font-semibold text-fg-primary">
              {isCorporate ? `Fetching ${memberNoun} from MCA Registry...` : "Verifying PAN"}
            </span>
          </div>
        ) : null}

        {/* Verified result */}
        {verified ? (
          <div className="flex flex-col gap-4 anim-fade">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-[18px] h-[18px] text-pos-fg shrink-0" strokeWidth={2} />
              <span className="text-[13.5px] text-fg-secondary">
                Successfully verified PAN for <span className="font-bold text-fg-primary">{verifiedName}</span>
              </span>
            </div>

            <div className="rounded-xl border border-line bg-surface-card p-4 flex flex-col gap-4" style={{ boxShadow: "var(--shadow-xs)" }}>
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                  <Landmark className="w-[18px] h-[18px] text-brand" strokeWidth={2} />
                </span>
                <p className="text-[13px] text-fg-secondary leading-snug">
                  We'll use the details below to complete KYC for <span className="font-semibold text-fg-primary">{verifiedName}</span>.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <Detail label="GST Number" value={gstin} />
                {HAS_CIN[entity] ? <Detail label="CIN Number" value={cin} /> : null}
                <Detail label={`State / UT`} value={state} />
              </div>
            </div>

            <span className="text-[12px] text-fg-tertiary leading-snug">
              By tapping Next, you consent to fetching these details from Central KYC for faster verification.
            </span>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-subtle pb-3 last:border-0 last:pb-0">
      <span className="text-[13px] text-fg-tertiary shrink-0">{label}</span>
      <span className="text-[14px] font-bold tracking-[0.03em] text-fg-primary text-right">{value}</span>
    </div>
  );
}
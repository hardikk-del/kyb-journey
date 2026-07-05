import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PenLine, Loader2, Check, RotateCcw, ChevronRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";

type SigStatus = "idle" | "uploading" | "done";

const RELATIONSHIPS = ["Spouse / Husband", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-[13px] font-semibold text-fg-primary">
      {children}
      {required ? <span className="text-neg"> *</span> : null}
    </span>
  );
}

export function SignatureNomineeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const stateMembers = location.state as { partners?: string[]; directors?: string[]; signatory?: string } | null;
  const partners = stateMembers?.directors ?? stateMembers?.partners ?? ["Ravi Kumar", "Rahul Mishra"];
  const isLlp = entity === "llp";
  const isLtd = entity === "ltd";
  const isCorporate = isLlp || isLtd;
  // Company designates the signatory explicitly; LLP defaults to the first partner.
  const authorisedSignatory = stateMembers?.signatory ?? partners[0];
  const signatoryRole = isLtd ? "director" : "designated partner";

  const [sig, setSig] = useState<SigStatus>("idle");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [relationshipOther, setRelationshipOther] = useState("");
  const [share, setShare] = useState("100");
  const [address, setAddress] = useState("");
  const [attested, setAttested] = useState(true);

  const uploadSig = () => {
    setSig("uploading");
    setTimeout(() => setSig("done"), 900);
  };

  // Nominee is optional — signature and the RM attestation gate Continue.
  const canContinue = sig === "done" && attested;

  const inputCls = "w-full h-12 px-3.5 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors";

  return (
    <Screen
      header={<StepHeader step="STEP 8 OF 9" title="Signature & nominee" progress={89} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button full variant="dark" disabled={!canContinue} onClick={() => navigate("/aof-esign", { state: { entity, partners, directors: partners, signatory: authorisedSignatory } })} rightIcon={<ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Continue
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        {/* ---- RM declaration & attestation ---- */}
        <button
          type="button"
          onClick={() => setAttested((p) => !p)}
          className="w-full flex items-start gap-3 text-left rounded-xl border border-line bg-surface-card p-4 transition-colors hover:bg-surface-hover"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <span className={["w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors", attested ? "bg-brand border-brand" : "border-line-strong"].join(" ")}>
            {attested ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-[14px] font-bold text-fg-primary">RM declaration &amp; attestation</span>
            <span className="text-[12.5px] text-fg-secondary leading-snug">
              I, RM Anita Desai (EMP-20481), confirm I conducted this onboarding and verified the originals.
            </span>
          </span>
        </button>

        {/* ---- Signature ---- */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">
            {isCorporate ? "AUTHORISED SIGNATORY SIGNATURE" : "CUSTOMER SIGNATURE"}<span className="text-neg"> *</span>
          </span>
          <span className="text-[13px] text-fg-tertiary -mt-0.5">
            {isCorporate
              ? `Capture or upload the signature of ${authorisedSignatory}, the ${signatoryRole} authorised to operate this account. This will be applied to the account opening form.`
              : "Capture or upload the customer's signature. This will be applied to the account opening form."}
          </span>

          {sig === "idle" ? (
            <button
              type="button"
              onClick={uploadSig}
              className="w-full h-[140px] rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-1.5 hover:border-brand hover:bg-surface-hover transition-colors"
            >
              <PenLine className="w-6 h-6 text-fg-tertiary" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-fg-primary">Capture or upload signature</span>
              <span className="text-[11px] text-fg-tertiary">JPG / PNG / PDF · on white paper</span>
            </button>
          ) : sig === "uploading" ? (
            <div className="w-full h-[140px] rounded-xl border border-line bg-surface-sunken flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-brand animate-spin" strokeWidth={2} />
              <span className="text-[13px] font-medium text-fg-secondary">Uploading…</span>
            </div>
          ) : (
            <div className="anim-fade">
              <div className="w-full rounded-xl border border-pos-border bg-surface-card overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-line-subtle">
                  <span className="text-[13px] font-semibold text-fg-primary">
                    {isCorporate ? `${authorisedSignatory}_signature.png` : "signature.png"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-pos-fg">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Captured
                  </span>
                </div>
                <div className="h-[96px] flex items-center justify-center bg-surface-sunken/40">
                  <svg viewBox="0 0 240 64" className="h-12 w-auto" fill="none" stroke="rgb(var(--c-fg-primary))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 44 C 26 8, 38 8, 40 36 C 41 50, 30 52, 34 40 C 40 22, 56 18, 60 40 C 62 52, 76 50, 84 30 C 92 12, 104 14, 100 40 L 112 22 C 118 40, 126 42, 138 26 C 150 12, 158 22, 156 38 C 170 20, 188 18, 196 38 C 200 48, 214 44, 232 24" />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                onClick={uploadSig}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-9 text-[13px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
                Re-upload
              </button>
            </div>
          )}
        </div>

        {/* ---- Nominee ---- */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">NOMINEE DETAILS</span>
            <span className="text-[10px] font-bold tracking-[0.05em] text-fg-tertiary bg-surface-sunken rounded px-1.5 py-0.5">OPTIONAL</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Nominee's full name</FieldLabel>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="As per the nominee's ID" />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Relationship with nominee</FieldLabel>
            <Dropdown value={relationship} options={RELATIONSHIPS} onChange={setRelationship} placeholder="Select relationship" />
            {relationship === "Other" ? (
              <input className={inputCls + " mt-1 anim-fade"} value={relationshipOther} onChange={(e) => setRelationshipOther(e.target.value)} placeholder="Specify relationship" />
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Share percentage</FieldLabel>
            <div className="flex items-center h-12 px-3.5 rounded-lg border border-line bg-surface-card focus-within:border-brand transition-colors">
              <input
                className="flex-1 bg-transparent text-[14px] text-fg-primary placeholder:text-fg-tertiary"
                value={share}
                inputMode="numeric"
                onChange={(e) => setShare(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                placeholder="100"
              />
              <span className="text-[14px] font-semibold text-fg-tertiary">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Nominee's address</FieldLabel>
            <textarea
              className="w-full min-h-[88px] p-3.5 rounded-lg border border-line bg-surface-card text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:border-brand transition-colors resize-none leading-snug"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House / flat, street, city, state and PIN"
            />
          </div>
        </div>
      </div>
    </Screen>
  );
}
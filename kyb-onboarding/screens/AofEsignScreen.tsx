import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Eye, ShieldCheck, Smartphone, Loader2, ChevronRight, X } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { ENTITY_META } from "../lib/entities";

const OTP_LEN = 6;
const MASKED_MOBILE = "+91 ••••• 41122";

export function AofEsignScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { entity?: string; partners?: string[]; directors?: string[]; signatory?: string } | null;
  const entity = state?.entity ?? "prop";
  const partners = state?.directors ?? state?.partners ?? ["Ravi Kumar", "Rahul Mishra"];
  const isLlp = entity === "llp";
  const isLtd = entity === "ltd";
  const isCorporate = isLlp || isLtd;
  const authorisedSignatory = state?.signatory ?? partners[0];
  const meta = ENTITY_META[entity as keyof typeof ENTITY_META];
  const aofSubtitle = meta ? `${meta.legalName} · Digital First Account` : "Kirana Traders · Digital First Account";

  const [stage, setStage] = useState<"intro" | "sending" | "otp" | "submitting">("intro");
  const [preview, setPreview] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [seconds, setSeconds] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const sendOtp = () => {
    setStage("sending");
    setTimeout(() => {
      setStage("otp");
      setSeconds(30);
      setTimeout(() => inputs.current[0]?.focus(), 60);
    }, 1100);
  };

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/[^0-9]/g, "");
    if (!clean) {
      setDigits((p) => p.map((d, idx) => (idx === i ? "" : d)));
      return;
    }
    setDigits((p) => p.map((d, idx) => (idx === i ? clean.slice(-1) : d)));
    if (i < OTP_LEN - 1) inputs.current[i + 1]?.focus();
    else inputs.current[i]?.blur(); // last digit: drop the caret so the box just reads filled
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const otpComplete = digits.every((d) => d !== "");

  const submit = () => {
    setStage("submitting");
    setTimeout(() => navigate("/submitted", { state: { entity, partners } }), 1400);
  };

  return (
    <Screen
      header={<StepHeader step="STEP 9 OF 9" title="Account opening form" progress={100} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          {stage === "otp" || stage === "submitting" ? (
            <Button
              full
              variant="dark"
              disabled={!otpComplete || stage === "submitting"}
              onClick={submit}
              leftIcon={stage === "submitting" ? <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2} /> : undefined}
            >
              {stage === "submitting" ? "Submitting AOF…" : "Verify & submit AOF"}
            </Button>
          ) : (
            <Button
              full
              variant="dark"
              disabled={stage === "sending"}
              onClick={sendOtp}
              leftIcon={stage === "sending" ? <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2} /> : undefined}
              rightIcon={stage === "intro" ? <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} /> : undefined}
            >
              {stage === "sending" ? "Sending OTP…" : "Send OTP to e-sign"}
            </Button>
          )}
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        {/* AOF document card */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">DOCUMENT</span>
          <div className="rounded-xl border border-line bg-surface-card p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="w-11 h-11 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-brand" strokeWidth={2} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[15px] font-semibold text-fg-primary leading-tight">Account Opening Form</span>
              <span className="text-[12.5px] text-fg-tertiary mt-0.5">
                {aofSubtitle}
              </span>
            </div>
            <button type="button" onClick={() => setPreview(true)} className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 h-9 text-[13px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors shrink-0">
              <Eye className="w-4 h-4" strokeWidth={2} />
              Preview
            </button>
          </div>
        </div>

        {/* Aadhaar e-sign */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">AADHAAR E-SIGN</span>

          {stage === "intro" || stage === "sending" ? (
            <div className="rounded-xl border border-line bg-surface-card p-4 flex flex-col gap-3.5 anim-fade" style={{ boxShadow: "var(--shadow-xs)" }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-sunken flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-fg-secondary" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-fg-primary leading-tight">e-Sign with Aadhaar OTP</span>
                  <span className="text-[13px] text-fg-secondary mt-1 leading-snug">
                    {isCorporate
                      ? `A one-time password will be sent to ${authorisedSignatory}'s (authorised signatory) Aadhaar-registered mobile number.`
                      : "A one-time password will be sent to the customer's Aadhaar-registered mobile number."}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-sunken px-3.5 h-12">
                <Smartphone className="w-4 h-4 text-fg-tertiary shrink-0" strokeWidth={2} />
                <span className="text-[14px] font-semibold text-fg-primary tracking-wide">{MASKED_MOBILE}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-surface-card p-4 flex flex-col gap-4 anim-fade" style={{ boxShadow: "var(--shadow-xs)" }}>
              <span className="text-[13.5px] text-fg-secondary leading-snug">
                Enter the 6-digit OTP sent to <span className="font-semibold text-fg-primary">{MASKED_MOBILE}</span>
              </span>
              <div className="flex items-center justify-between gap-2">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className={[
                      "w-12 h-14 rounded-xl border text-center text-[20px] font-bold text-fg-primary transition-colors",
                      d ? "border-brand bg-surface-selected" : "border-line bg-surface-card",
                      "focus:border-brand focus:bg-surface-card",
                    ].join(" ")}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-fg-tertiary">Didn't get it?</span>
                {seconds > 0 ? (
                  <span className="text-[13px] font-medium text-fg-tertiary">Resend in 0:{seconds.toString().padStart(2, "0")}</span>
                ) : (
                  <button type="button" onClick={sendOtp} className="text-[13px] font-semibold text-brand">Resend OTP</button>
                )}
              </div>
            </div>
          )}

          <span className="text-[12px] text-fg-tertiary leading-snug px-1">
            By e-signing, the customer authorises the bank to open the account on the terms in the AOF.
          </span>
        </div>
      </div>

      {preview ? <AofPreview entity={entity} authorisedSignatory={authorisedSignatory} partners={partners} onClose={() => setPreview(false)} /> : null}
    </Screen>
  );
}

/* ---------- AOF document preview ---------- */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-line-subtle last:border-0">
      <span className="text-[12px] text-fg-tertiary shrink-0">{label}</span>
      <span className="text-[12.5px] font-medium text-fg-primary text-right leading-snug">{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold tracking-[0.08em] text-fg-tertiary mb-1">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function AofPreview({ entity, authorisedSignatory, partners, onClose }: { entity: string; authorisedSignatory: string; partners: string[]; onClose: () => void }) {
  const isLlp = entity === "llp";
  const isLtd = entity === "ltd";
  const isCorporate = isLlp || isLtd;
  const meta = ENTITY_META[entity as keyof typeof ENTITY_META];
  const memberNoun = (meta?.memberNoun ?? "MEMBERS").toUpperCase();
  const memberSingular = meta?.memberNounSingular ?? "Member";
  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col anim-fade">
      <div className="shrink-0 flex items-center justify-between px-5 h-14 bg-surface-card border-b border-line-subtle">
        <span className="text-[15px] font-bold text-fg-primary">Account Opening Form</span>
        <button type="button" onClick={onClose} aria-label="Close preview" className="w-8 h-8 -mr-1.5 rounded-full flex items-center justify-center text-fg-secondary hover:bg-surface-hover transition-colors">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
        <div className="rounded-xl border border-line bg-surface-card p-5 flex flex-col gap-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex flex-col items-center text-center pb-4 border-b border-line">
            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-brand" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-fg-primary">Current Account Opening Form</span>
            <span className="text-[11.5px] text-fg-tertiary mt-0.5">Generated 20 Jun 2026 · Ref AOF-2026-0X4F19</span>
          </div>

          <Block title="ENTITY">
            <Row label="Legal name" value={meta?.legalName ?? "Kirana Traders"} />
            <Row label="Constitution" value={meta?.constitution ?? "Proprietorship"} />
            <Row label="PAN" value={meta?.pan ?? "BNZPM2501F"} />
            <Row label="Registered address" value="Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059" />
          </Block>

          {isCorporate ? (
            <Block title={memberNoun}>
              {partners.map((p, i) => (
                <Row key={p} label={`${memberSingular} ${i + 1}`} value={p} />
              ))}
              <Row label="Authorised signatory" value={authorisedSignatory} />
            </Block>
          ) : (
            <Block title="PROPRIETOR">
              <Row label="Name" value="Ravi Kumar" />
              <Row label="Mobile" value="+91 98200 41122" />
              <Row label="Email" value="ravi@kiranatraders.in" />
            </Block>
          )}

          <Block title="ACCOUNT">
            <Row label="Product" value="Digital First Account" />
            <Row label="Minimum balance" value="₹35,000" />
            <Row label="MCC" value="5131 · Wholesale Textiles" />
          </Block>

          <Block title="NOMINEE">
            <Row label="Status" value="Not nominated" />
          </Block>

          <div className="flex flex-col pt-1">
            <span className="text-[10px] font-bold tracking-[0.08em] text-fg-tertiary mb-2">
              {isCorporate ? `SIGNATURE OF AUTHORISED SIGNATORY (${authorisedSignatory.toUpperCase()})` : "SIGNATURE OF APPLICANT"}
            </span>
            <div className="h-[80px] rounded-lg border border-line bg-surface-sunken/40 flex items-center justify-center">
              <svg viewBox="0 0 240 64" className="h-11 w-auto" fill="none" stroke="rgb(var(--c-fg-primary))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 44 C 26 8, 38 8, 40 36 C 41 50, 30 52, 34 40 C 40 22, 56 18, 60 40 C 62 52, 76 50, 84 30 C 92 12, 104 14, 100 40 L 112 22 C 118 40, 126 42, 138 26 C 150 12, 158 22, 156 38 C 170 20, 188 18, 196 38 C 200 48, 214 44, 232 24" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <BottomBar>
          <Button full variant="dark" onClick={onClose}>Close preview</Button>
        </BottomBar>
      </div>
    </div>
  );
}
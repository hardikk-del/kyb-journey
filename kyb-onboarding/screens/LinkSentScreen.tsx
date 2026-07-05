import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, Check, Copy, Clock, ArrowRight, MessageCircle } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

const propRequested = [
  { title: "Identity and address proof", sub: "PAN and one address proof" },
  { title: "Selfie verification", sub: "Live selfie for face match" },
  { title: "Business proof", sub: "Any 2 documents in the firm name" },
];

const ltdRequested = [
  { title: "Certificate of Incorporation", sub: "Issued by the Registrar of Companies" },
  { title: "Directors, shareholding & board resolution", sub: "On company letterhead" },
  { title: "Authorised signatory KYC", sub: "Identity & address proof of the signatory" },
  { title: "Business address proof", sub: "GST, trade licence or utility bill (< 3 months)" },
];

export function LinkSentScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { entity?: string; directors?: string[]; signatory?: string } | null;
  const entity = state?.entity ?? "prop";
  const directors = state?.directors;
  const signatory = state?.signatory;
  const requested = entity === "ltd" ? ltdRequested : propRequested;
  const [copied, setCopied] = useState(false);

  return (
    <Screen
      header={<StepHeader step="STEP 2 OF 9" title="Link sent to customer" progress={22} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button full variant="dark" onClick={() => navigate("/review", { state: { entity, directors, signatory } })} rightIcon={<ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Track upload status
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-16 h-16 rounded-full bg-surface-selected flex items-center justify-center">
            <Send className="w-7 h-7 text-brand" strokeWidth={1.75} />
          </div>
          <h2 className="text-[22px] font-bold tracking-tight text-fg-primary">Document link sent</h2>
          <p className="text-[15px] text-fg-tertiary leading-snug max-w-[300px]">
            {entity === "ltd" ? signatory ?? "The authorised signatory" : "Ravi Kumar"} can now upload the required documents from their own phone.
          </p>
        </div>

        <div className="rounded-xl border border-line-subtle bg-surface-card p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
          <span className="w-11 h-11 rounded-full bg-pos flex items-center justify-center shrink-0">
            <MessageCircle className="w-[22px] h-[22px] text-white" strokeWidth={2} />
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[16px] font-semibold text-fg-primary leading-tight">Sent on WhatsApp</span>
            <span className="text-[14px] text-fg-tertiary font-mono">+91 76065 12345</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-pos shrink-0">
            <Check className="w-4 h-4" strokeWidth={2.5} />
            Delivered
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">SECURE LINK</span>
          <div className="flex items-center gap-2 h-13 px-3.5 py-2.5 rounded-xl border border-line bg-surface-sunken">
            <span className="flex-1 text-[15px] font-mono text-fg-secondary truncate">cashfree.in/kyc/Nl8x2K</span>
            <button
              type="button"
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-card px-3 h-10 text-[14px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-pos" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">REQUESTED FROM CUSTOMER</span>
          <div className="rounded-xl border border-line-subtle bg-surface-card overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
            {requested.map((r, i) => (
              <div key={r.title} className={["flex items-center gap-3 px-4 py-3.5", i > 0 ? "border-t border-line-subtle" : ""].join(" ")}>
                <span className="w-6 h-6 rounded-full border-2 border-dashed border-line-strong shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-fg-primary leading-tight">{r.title}</span>
                  <span className="text-[14px] text-fg-tertiary mt-0.5">{r.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-fg-tertiary">
          <Clock className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span className="text-[14px] leading-snug">Link is valid for 24 hours. You will be notified as documents arrive.</span>
        </div>
      </div>
    </Screen>
  );
}

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, MessageCircle, ArrowRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

type Doc = { title: string; sub: string };

const CHECKLISTS: Record<string, Doc[]> = {
  prop: [
    { title: "Identity & address", sub: "Personal KYC of the proprietor" },
    { title: "Business proof I", sub: "Registration & constitution" },
    { title: "Business proof II", sub: "Address & operations" },
    { title: "Bureau check", sub: "Credit & compliance screening" },
  ],
  partner: [
    { title: "Business PAN", sub: "PAN of the firm" },
    { title: "Partner KYC", sub: "Identity & address of each partner" },
    { title: "Partnership deed", sub: "Executed deed of the firm" },
    { title: "Registration certificate", sub: "Govt certificate of name, address & activity" },
    { title: "Applicant signature", sub: "Applicant or one partner" },
  ],
  llp: [
    { title: "Business PAN", sub: "PAN of the LLP" },
    { title: "Partner KYC", sub: "Identity & address of partners / signatories" },
    { title: "LLP agreement", sub: "Executed agreement of the LLP" },
    { title: "Incorporation certificate", sub: "Issued by the Registrar of Companies" },
    { title: "Account-opening resolution", sub: "Authorising the current account" },
    { title: "Applicant signature", sub: "Applicant or authorised signatory" },
  ],
  huf: [
    { title: "Business PAN", sub: "PAN in the name of the HUF" },
    { title: "Karta KYC", sub: "Identity & address of the Karta" },
    { title: "HUF declaration", sub: "Signed by all co-parceners, naming the Karta" },
    { title: "Karta signature", sub: "Authorised to operate the account" },
  ],
  ltd: [
    { title: "Business PAN", sub: "PAN of the company" },
    { title: "Signatory KYC", sub: "Directors list + authorised signatory ID" },
    { title: "Incorporation certificate", sub: "Issued by the Registrar of Companies" },
    { title: "Board resolution", sub: "Directors & shareholding, on letterhead" },
    { title: "Business address proof", sub: "GST, trade licence or utility bill (< 3 months)" },
    { title: "Applicant signature", sub: "Applicant or authorised signatory" },
  ],
};

export function ChecklistScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const directors = (location.state as { directors?: string[] } | null)?.directors;
  const signatory = (location.state as { signatory?: string } | null)?.signatory;
  const steps = CHECKLISTS[entity] ?? CHECKLISTS.prop;

  const [method, setMethod] = useState<"upload" | "link">("link");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [mobile, setMobile] = useState("7606512345");

  const isLink = method === "link";

  return (
    <Screen
      header={<StepHeader step="STEP 2 OF 9" title="Document checklist" progress={22} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button
            full
            variant="dark"
            onClick={() => {
              if (isLink) {
                navigate("/link-sent", { state: { entity, directors, signatory } });
                return;
              }

              if (entity === "llp") {
                navigate("/business-docs", { state: { entity: "llp" } });
                return;
              }

              if (entity === "ltd") {
                navigate("/business-docs", { state: { entity: "ltd", directors, signatory } });
                return;
              }

              navigate("/identity");
            }}
            rightIcon={<ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}
          >
            {isLink ? "Send document link" : "Start uploading"}
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        <p className="text-[15px] text-fg-tertiary">Collect these documents to open the current account.</p>

        <div className="flex flex-col">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full border border-line-strong flex items-center justify-center text-[13px] font-semibold text-fg-secondary shrink-0">
                  {i + 1}
                </span>
                {i < steps.length - 1 ? <span className="w-px flex-1 bg-line my-1" /> : null}
              </div>
              <div className="flex flex-col pb-6 pt-1">
                <span className="text-[16px] font-semibold text-fg-primary leading-tight">{s.title}</span>
                <span className="text-[14px] text-fg-tertiary mt-0.5">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">HOW TO COLLECT DOCUMENTS</span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: "upload", label: "I'll upload now" },
                { id: "link", label: "Send link to customer" },
              ] as const
            ).map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={[
                    "h-14 rounded-xl border text-[15px] font-semibold transition-colors px-2",
                    active ? "border-brand bg-surface-selected text-brand" : "border-line bg-surface-card text-fg-primary hover:bg-surface-hover",
                  ].join(" ")}
                  style={{ boxShadow: active ? "none" : "var(--shadow-xs)" }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLink ? (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] text-fg-tertiary -mt-1">Choose a channel where the customer will receive the form link.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={[
                  "h-14 rounded-xl border flex items-center justify-center gap-2.5 text-[15px] font-semibold transition-colors",
                  channel === "sms" ? "border-fg-primary bg-surface-card text-fg-primary" : "border-line bg-surface-card text-fg-secondary hover:bg-surface-hover",
                ].join(" ")}
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <MessageSquare className="w-5 h-5" strokeWidth={1.75} />
                SMS
              </button>
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={[
                  "h-14 rounded-xl border flex items-center justify-center gap-2.5 text-[15px] font-semibold transition-colors",
                  channel === "whatsapp" ? "border-fg-primary bg-surface-card text-fg-primary" : "border-line bg-surface-card text-fg-secondary hover:bg-surface-hover",
                ].join(" ")}
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <MessageCircle className="w-5 h-5 text-pos" strokeWidth={1.75} />
                WhatsApp
              </button>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[15px] font-bold text-fg-primary">
                Customer's mobile number <span className="text-neg">*</span>
              </span>
              <div className="flex items-center gap-2.5 h-14 px-3.5 rounded-xl border border-line bg-surface-card">
                <span className="w-6 h-4 rounded-sm overflow-hidden flex flex-col shrink-0">
                  <span className="flex-1 bg-[#FF9933]" />
                  <span className="flex-1 bg-white" />
                  <span className="flex-1 bg-[#138808]" />
                </span>
                <span className="text-[15px] font-semibold text-fg-primary">+91</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  className="flex-1 bg-transparent text-[15px] text-fg-primary tracking-wider outline-none"
                />
              </div>
              <span className="text-[13px] text-fg-tertiary">This number will be used to send the link.</span>
            </label>
          </div>
        ) : (
          <div className="rounded-xl border border-line-subtle bg-surface-card p-4 flex flex-col gap-1" style={{ boxShadow: "var(--shadow-xs)" }}>
            <span className="text-[15px] font-semibold text-fg-primary">You'll capture documents now</span>
            <span className="text-[14px] text-fg-tertiary">Use this device to scan the customer's PAN, address proof, a live selfie, and business documents.</span>
          </div>
        )}
      </div>
    </Screen>
  );
}

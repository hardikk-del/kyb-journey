import { useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, RotateCcw, Check, Trash2, Camera, Eye, ArrowRight, Landmark, PenTool } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { ProgressMeter } from "../components/ProgressMeter";
import { StatusBadge } from "../components/StatusBadge";
import { DocThumb } from "../components/DocImage";
import { DocViewer } from "../components/DocViewer";
import { Dropzone, ProcessingTile } from "../components/UploadTile";
import { useUpload } from "../lib/useUpload";

const SELFIE =
  "https://d1kwhi236ua7t6.cloudfront.net/6142cad6-1cb6-4299-bba0-8a52f16313fa/projects/d4245685-58c8-4fa3-97b0-00b0205930ba/attachments/image%20%281%29.png";

function ApproveRow({ approved, onApprove, onUndo }: { approved: boolean; onApprove: () => void; onUndo: () => void }) {
  if (approved) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-pos-bg px-3.5 h-12">
        <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-pos-fg">
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Approved
        </span>
        <button type="button" onClick={onUndo} className="text-[13px] font-medium text-fg-tertiary hover:text-fg-secondary">Undo</button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" className="h-12 rounded-md border border-line bg-surface-card inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors">
        <RotateCcw className="w-4 h-4" strokeWidth={2} />
        Ask for retake
      </button>
      <button type="button" onClick={onApprove} className="h-12 rounded-md bg-fg-primary text-surface-card inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold hover:bg-black transition-colors">
        <Check className="w-4 h-4" strokeWidth={2.5} />
        Approve
      </button>
    </div>
  );
}

function ReviewCard({
  icon, title, subtitle, body, approved, onApprove, onUndo,
}: {
  icon: ReactNode; title: string; subtitle: string; body?: ReactNode; approved: boolean; onApprove: () => void; onUndo: () => void;
}) {
  return (
    <div className={["rounded-xl border bg-surface-card p-4 flex flex-col gap-3.5", approved ? "border-pos-border" : "border-line-subtle"].join(" ")} style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center shrink-0">{icon}</div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[16px] font-semibold text-fg-primary leading-tight">{title}</span>
          <span className="text-[13px] font-mono text-fg-tertiary mt-0.5">{subtitle}</span>
        </div>
        <StatusBadge kind="verified" />
      </div>
      {body}
      <ApproveRow approved={approved} onApprove={onApprove} onUndo={onUndo} />
    </div>
  );
}

const digilockerRows: [string, string][] = [
  ["Name", "Ravi Kumar"],
  ["Date of birth", "14 Mar 1988"],
  ["Aadhaar", "xxxx xxxx 1234"],
  ["Address", "Coimbatore, TN 641001"],
];

const partnerTwoRows: [string, string][] = [
  ["Name", "Rahul Mishra"],
  ["Date of birth", "22 Jul 1991"],
  ["Aadhaar", "xxxx xxxx 5678"],
  ["Address", "Bengaluru, KA 560001"],
];

const directorThreeRows: [string, string][] = [
  ["Name", "Anjali Sharma"],
  ["Date of birth", "09 Nov 1985"],
  ["Aadhaar", "xxxx xxxx 9012"],
  ["Address", "Pune, MH 411001"],
];

export function ReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const directors = (location.state as { directors?: string[] } | null)?.directors ?? ["Ravi Kumar", "Rahul Mishra", "Anjali Sharma"];
  const signatory = (location.state as { signatory?: string } | null)?.signatory ?? directors[0];
  const isLlp = entity === "llp";
  const isLtd = entity === "ltd";
  const isCorporate = isLlp || isLtd;

  // Sole Prop Approval States
  const [panApproved, setPanApproved] = useState(false);
  const [aadhaarApproved, setAadhaarApproved] = useState(false);
  const [selfieApproved, setSelfieApproved] = useState(false);
  const bizI = useUpload("idle");
  const bizII = useUpload("idle");

  // LLP Approval States (6 Documents Framework)
  const [llpPanApproved, setLlpPanApproved] = useState(false);
  const [coiApproved, setCoiApproved] = useState(false);
  const [agreementApproved, setAgreementApproved] = useState(false);
  const [resolutionApproved, setResolutionApproved] = useState(false);
  const [partnerKycApproved, setPartnerKycApproved] = useState(false);
  const [signatureApproved, setSignatureApproved] = useState(false);

  // Ltd (company) Approval States — 6 items
  const [ltdPanApproved, setLtdPanApproved] = useState(false);
  const [ltdCoiApproved, setLtdCoiApproved] = useState(false);
  const [ltdDirectorsApproved, setLtdDirectorsApproved] = useState(false);
  const [ltdAddressApproved, setLtdAddressApproved] = useState(false);
  const [ltdKycApproved, setLtdKycApproved] = useState(false);
  const [ltdSignatureApproved, setLtdSignatureApproved] = useState(false);

  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);

  // Structural Counter Calculation
  const bizReceived = (bizI.status === "verified" ? 1 : 0) + (bizII.status === "verified" ? 1 : 0);

  const totalItems = isCorporate ? 6 : 4;
  const currentReceived = isCorporate ? 6 : (2 + bizReceived);
  const allReceived = isCorporate ? true : (bizReceived === 2);

  const propApproved = panApproved && aadhaarApproved && selfieApproved && allReceived;
  const llpApproved = llpPanApproved && coiApproved && agreementApproved && resolutionApproved && partnerKycApproved && signatureApproved;
  const ltdApproved = ltdPanApproved && ltdCoiApproved && ltdDirectorsApproved && ltdAddressApproved && ltdKycApproved && ltdSignatureApproved;
  const corporateApproved = isLlp ? llpApproved : ltdApproved;
  const allApproved = isCorporate ? corporateApproved : propApproved;

  const ctaLabel = isCorporate
    ? (corporateApproved ? "Verify & Continue" : `Approve all corporate & ${isLtd ? "director" : "partner"} items`)
    : (!allReceived
        ? `Waiting for ${4 - currentReceived} document${4 - currentReceived > 1 ? "s" : ""}`
        : (allApproved ? "Proceed" : "Approve identity docs to proceed"));

  const bizSlot = (
    n: "I" | "II",
    slot: ReturnType<typeof useUpload>,
    label: string,
    fileName: string,
  ) => {
    const num = n === "I" ? 1 : 2;
    if (slot.status === "verified") {
      return (
        <div className="rounded-xl border border-pos-border bg-surface-card p-4 flex flex-col gap-3.5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-pos text-surface-card flex items-center justify-center">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">BUSINESS DOCUMENT {num}</span>
            </div>
            <StatusBadge kind="verified" />
          </div>
          <DocThumb label={label} onView={() => setViewer({ label: `Business proof ${n}`, meta: fileName })} />
          <div className="flex items-center justify-between gap-3 -mt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-[18px] h-[18px] text-fg-tertiary shrink-0" strokeWidth={1.75} />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[14px] font-medium text-fg-primary truncate">{fileName}</span>
                <span className="text-[12px] text-fg-tertiary">Uploaded by you · 240 KB</span>
              </div>
            </div>
            <button
              type="button"
              onClick={slot.reset}
              aria-label="Remove document"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-9 text-[13px] font-semibold text-neg hover:bg-surface-hover transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
              Remove
            </button>
          </div>
        </div>
      );
    }
    if (slot.status === "idle") {
      return (
        <div className="rounded-xl border border-line-subtle bg-surface-card p-4 flex flex-col gap-3.5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-surface-sunken text-fg-tertiary flex items-center justify-center text-[12px] font-semibold">{num}</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">BUSINESS DOCUMENT {num}</span>
          </div>
          <Dropzone title="Upload document" hint="Waiting for customer · or upload now" onPick={slot.start} dense />
        </div>
      );
    }
    return <ProcessingTile status={slot.status} label={`Business proof ${n}`} dense />;
  };

  return (
    <Screen
      header={
        <StepHeader
          step="STEP 2 OF 9"
          title={allReceived ? "Review & approve" : "Awaiting documents"}
          progress={Math.round((currentReceived / totalItems) * 100)}
          onBack={() => navigate(-1)}
        />
      }
      footer={
        <BottomBar>
          <Button
            full
            variant="dark"
            disabled={!allApproved}
            onClick={() => navigate(isLtd ? "/shareholding" : "/self-declaration", { state: { entity, directors, signatory } })}
            rightIcon={allApproved ? <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} /> : undefined}
          >
            {ctaLabel}
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        <ProgressMeter done={currentReceived} total={totalItems} verb="received" />

        {isLlp ? (
          /* =========================================================
             CORPORATE LLP WORKFLOW (6 REQUIRED SECTIONS)
             ========================================================= */
          <>
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">COMPANY LEGAL DOCUMENTS</span>
              
              <ReviewCard
                icon={<FileText className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Business PAN card"
                subtitle="JHDCLKSJDB"
                body={
                  <div className="flex flex-col gap-2">
                    <DocThumb label="Business PAN" onView={() => setViewer({ label: "Business PAN", meta: "JHDCLKSJDB" })} />
                    <div className="rounded-lg bg-surface-selected px-3.5 py-2.5 flex flex-col gap-1 text-[13px]">
                      <div className="flex justify-between"><span className="text-fg-tertiary">Entity Name</span><span className="font-semibold text-fg-primary text-right">Finramp Technologies Pvt Ltd</span></div>
                    </div>
                  </div>
                }
                approved={llpPanApproved}
                onApprove={() => setLlpPanApproved(true)}
                onUndo={() => setLlpPanApproved(false)}
              />

              <ReviewCard
                icon={<Landmark className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Certificate of Incorporation"
                subtitle="ROC-BANGALORE"
                body={<DocThumb label="COI Document" onView={() => setViewer({ label: "Certificate of Incorporation", meta: "coi_proof.pdf" })} />}
                approved={coiApproved}
                onApprove={() => setCoiApproved(true)}
                onUndo={() => setCoiApproved(false)}
              />

              <ReviewCard
                icon={<FileText className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="LLP Agreement"
                subtitle="Executed Deed"
                body={<DocThumb label="LLP Agreement" onView={() => setViewer({ label: "LLP Agreement", meta: "llp_agreement.pdf" })} />}
                approved={agreementApproved}
                onApprove={() => setAgreementApproved(true)}
                onUndo={() => setAgreementApproved(false)}
              />

              <ReviewCard
                icon={<Landmark className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Resolution for Account Opening"
                subtitle="Board Authorization"
                body={<DocThumb label="Board Resolution" onView={() => setViewer({ label: "Account Resolution", meta: "board_resolution.pdf" })} />}
                approved={resolutionApproved}
                onApprove={() => setResolutionApproved(true)}
                onUndo={() => setResolutionApproved(false)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">PARTNER KYC & SIGNATURES</span>
              
              <ReviewCard
                icon={<ShieldCheck className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Partner KYC (Designated Partners)"
                subtitle="Multi-Partner Audit"
                body={
                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg bg-surface-selected px-3.5 py-3 flex flex-col gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-brand">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                        PARTNER 1 FETCHED VIA DIGILOCKER
                      </span>
                      {digilockerRows.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <span className="text-[14px] text-fg-tertiary">{k}</span>
                          <span className="text-[14px] font-medium text-fg-primary text-right">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-surface-selected px-3.5 py-3 flex flex-col gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-brand">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                        PARTNER 2 FETCHED VIA DIGILOCKER
                      </span>
                      {partnerTwoRows.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <span className="text-[14px] text-fg-tertiary">{k}</span>
                          <span className="text-[14px] font-medium text-fg-primary text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
                approved={partnerKycApproved}
                onApprove={() => setPartnerKycApproved(true)}
                onUndo={() => setPartnerKycApproved(false)}
              />

              <ReviewCard
                icon={<PenTool className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Signature of Applicant / Signatory"
                subtitle="AOF Specimen Capture"
                body={
                  <div className="rounded-lg border border-line-subtle bg-surface-sunken p-4 flex flex-col items-center justify-center min-h-[100px]">
                    <span className="font-serif italic text-[24px] text-fg-secondary select-none tracking-widest opacity-60">Ravi Kumar</span>
                    <span className="text-[11px] text-fg-tertiary tracking-wider uppercase mt-2">Captured Digital Specimen</span>
                  </div>
                }
                approved={signatureApproved}
                onApprove={() => setSignatureApproved(true)}
                onUndo={() => setSignatureApproved(false)}
              />
            </div>
          </>
        ) : isLtd ? (
          /* =========================================================
             CORPORATE COMPANY (PVT / PUBLIC LTD) WORKFLOW
             ========================================================= */
          <>
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">COMPANY LEGAL DOCUMENTS</span>

              <ReviewCard
                icon={<FileText className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Business PAN card"
                subtitle="AAGCF5123R"
                body={
                  <div className="flex flex-col gap-2">
                    <DocThumb label="Business PAN" onView={() => setViewer({ label: "Business PAN", meta: "AAGCF5123R" })} />
                    <div className="rounded-lg bg-surface-selected px-3.5 py-2.5 flex flex-col gap-1 text-[13px]">
                      <div className="flex justify-between"><span className="text-fg-tertiary">Entity Name</span><span className="font-semibold text-fg-primary text-right">Finramp Technologies Pvt Ltd</span></div>
                    </div>
                  </div>
                }
                approved={ltdPanApproved}
                onApprove={() => setLtdPanApproved(true)}
                onUndo={() => setLtdPanApproved(false)}
              />

              <ReviewCard
                icon={<Landmark className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Certificate of Incorporation"
                subtitle="ROC-BANGALORE"
                body={<DocThumb label="COI Document" onView={() => setViewer({ label: "Certificate of Incorporation", meta: "coi_proof.pdf" })} />}
                approved={ltdCoiApproved}
                onApprove={() => setLtdCoiApproved(true)}
                onUndo={() => setLtdCoiApproved(false)}
              />

              <ReviewCard
                icon={<FileText className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Directors, Shareholding & Board Resolution"
                subtitle="On company letterhead"
                body={<DocThumb label="Board Resolution" onView={() => setViewer({ label: "Directors, Shareholding & Board Resolution", meta: "board_resolution.pdf" })} />}
                approved={ltdDirectorsApproved}
                onApprove={() => setLtdDirectorsApproved(true)}
                onUndo={() => setLtdDirectorsApproved(false)}
              />

              <ReviewCard
                icon={<Landmark className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Business Address Proof"
                subtitle="GST / trade licence / utility bill"
                body={<DocThumb label="GST certificate" onView={() => setViewer({ label: "Business Address Proof", meta: "gst_certificate.pdf" })} />}
                approved={ltdAddressApproved}
                onApprove={() => setLtdAddressApproved(true)}
                onUndo={() => setLtdAddressApproved(false)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">DIRECTOR KYC & SIGNATURES</span>

              <ReviewCard
                icon={<ShieldCheck className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Director KYC"
                subtitle={`${directors.length} directors · signatory ${signatory}`}
                body={
                  <div className="flex flex-col gap-3">
                    {[digilockerRows, partnerTwoRows, directorThreeRows].slice(0, directors.length).map((rows, i) => (
                      <div key={i} className="rounded-lg bg-surface-selected px-3.5 py-3 flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-brand">
                          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                          {(directors[i] ?? `DIRECTOR ${i + 1}`).toUpperCase()}
                          {directors[i] === signatory ? " · AUTHORISED SIGNATORY" : ""}
                        </span>
                        {rows.map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-3">
                            <span className="text-[14px] text-fg-tertiary">{k}</span>
                            <span className="text-[14px] font-medium text-fg-primary text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                }
                approved={ltdKycApproved}
                onApprove={() => setLtdKycApproved(true)}
                onUndo={() => setLtdKycApproved(false)}
              />

              <ReviewCard
                icon={<PenTool className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Signature of Authorised Signatory"
                subtitle="AOF Specimen Capture"
                body={
                  <div className="rounded-lg border border-line-subtle bg-surface-sunken p-4 flex flex-col items-center justify-center min-h-[100px]">
                    <span className="font-serif italic text-[24px] text-fg-secondary select-none tracking-widest opacity-60">{signatory}</span>
                    <span className="text-[11px] text-fg-tertiary tracking-wider uppercase mt-2">Captured Digital Specimen</span>
                  </div>
                }
                approved={ltdSignatureApproved}
                onApprove={() => setLtdSignatureApproved(true)}
                onUndo={() => setLtdSignatureApproved(false)}
              />
            </div>
          </>
        ) : (
          /* =========================================================
             ORIGINAL SOLE PROP WORKFLOW
             ========================================================= */
          <>
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">IDENTITY AND ADDRESS</span>
              <ReviewCard
                icon={<FileText className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="PAN card"
                subtitle="BNZPM2501F"
                body={<DocThumb label="PAN card" onView={() => setViewer({ label: "PAN card", meta: "BNZPM2501F" })} />}
                approved={panApproved}
                onApprove={() => setPanApproved(true)}
                onUndo={() => setPanApproved(false)}
              />
              <ReviewCard
                icon={<ShieldCheck className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Aadhaar via DigiLocker"
                subtitle="xxxx xxxx 1234"
                body={
                  <div className="rounded-lg bg-surface-selected px-3.5 py-3 flex flex-col gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-brand">
                      <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      FETCHED FROM DIGILOCKER
                    </span>
                    {digilockerRows.map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3">
                        <span className="text-[14px] text-fg-tertiary">{k}</span>
                        <span className="text-[14px] font-medium text-fg-primary text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                }
                approved={aadhaarApproved}
                onApprove={() => setAadhaarApproved(true)}
                onUndo={() => setAadhaarApproved(false)}
              />
              <ReviewCard
                icon={<Camera className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />}
                title="Selfie verification"
                subtitle="Liveness passed"
                body={
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setViewer({ label: "Selfie", meta: "Live capture" })}
                      aria-label="View selfie"
                      className="relative w-full rounded-lg overflow-hidden border border-line-subtle block"
                    >
                      <img src={SELFIE} alt="Customer selfie" className="w-full h-56 object-cover object-top bg-surface-sunken" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-pos px-2.5 h-7 text-[12px] font-semibold text-white">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                        97% face match
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-fg-primary/90 px-2.5 h-7 text-[12px] font-medium text-surface-card">
                        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                        Tap to view
                      </span>
                    </button>
                    <div className="rounded-lg bg-pos-bg px-3.5 py-2.5 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-pos-fg mt-0.5 shrink-0" strokeWidth={2} />
                      <span className="text-[13px] text-pos-fg leading-snug">
                        Face is consistent with the PAN photo and DigiLocker (Aadhaar) image.
                      </span>
                    </div>
                  </div>
                }
                approved={selfieApproved}
                onApprove={() => setSelfieApproved(true)}
                onUndo={() => setSelfieApproved(false)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">BUSINESS PROOF</span>
                <span className="text-[13px] font-medium text-fg-tertiary">any 2</span>
              </div>
              {bizSlot("I", bizI, "GST certificate", "GST_certificate.pdf")}
              {bizSlot("II", bizII, "Utility bill", "Utility_bill.pdf")}
            </div>
          </>
        )}
      </div>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ""} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </Screen>
  );
}
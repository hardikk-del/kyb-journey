import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Trash2, Check, ArrowRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { ProgressMeter } from "../components/ProgressMeter";
import { StatusBadge } from "../components/StatusBadge";
import { Dropdown } from "../components/Dropdown";
import { DocThumb } from "../components/DocImage";
import { DocViewer } from "../components/DocViewer";
import { Dropzone, ProcessingTile } from "../components/UploadTile";
import { useUpload } from "../lib/useUpload";

const docTypes = [
  "CST / VAT / GST certificate",
  "Shops & Establishment licence",
  "Udyam / MSME certificate",
  "Utility bill (electricity / water / landline)",
  "Trade licence",
  "Current account statement",
];

// Fixed corporate document sets, keyed by entity. The first slot is pre-verified
// (mirrors the demo's "already collected" first document).
const CORP_DOCS: Record<string, { title: string; subtext: string }[]> = {
  llp: [
    { title: "LLP Agreement", subtext: "Executed agreement of the LLP" },
    { title: "Certificate of Incorporation", subtext: "Issued by the Registrar of Companies" },
    { title: "Resolution for Account Opening", subtext: "Board resolution on letterhead authorizing the current account" },
  ],
  ltd: [
    { title: "Certificate of Incorporation", subtext: "Issued by the Registrar of Companies" },
    { title: "Directors, Shareholding & Board Resolution", subtext: "List of directors, shareholding pattern & board resolution on letterhead" },
    { title: "Authorised Signatory ID & Address", subtext: "Identity & address proof of the authorised signatory" },
    { title: "Business Address Proof", subtext: "GST, trade licence or utility bill (< 3 months)" },
  ],
};

function fileNameFor(type: string) {
  const stem = type.split(/[ /]/)[0].toLowerCase();
  return `${stem}_proof.pdf`;
}

type Slot = ReturnType<typeof useUpload>;

function DocSlot({
  index,
  type,
  slot,
  disabledOptions,
  onType,
  onView,
  title,
  subtext,
  options,
  isFixed,
}: {
  index: number;
  type: string;
  slot: Slot;
  disabledOptions: string[];
  onType: (v: string) => void;
  onView: (label: string, meta: string) => void;
  title: string;
  subtext?: string;
  options: string[];
  isFixed: boolean;
}) {
  const verified = slot.status === "verified";
  const locked = slot.status !== "idle";
  const fileName = fileNameFor(type);

  return (
    <div
      className={["rounded-xl border bg-surface-card p-4 flex flex-col gap-3.5", verified ? "border-pos-border" : "border-line-subtle"].join(" ")}
      style={{ boxShadow: "var(--shadow-xs)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={[
              "w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0",
              verified ? "bg-pos text-surface-card" : "bg-surface-sunken text-fg-tertiary",
            ].join(" ")}
          >
            {verified ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : index + 1}
          </span>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">{title}</span>
            {subtext ? <span className="text-[12px] text-fg-tertiary mt-0.5">{subtext}</span> : null}
          </div>
        </div>
        {verified ? <StatusBadge kind="verified" /> : slot.status === "verifying" ? <StatusBadge kind="verifying" /> : null}
      </div>

      {/* Keeps the dropdown layout but locks it to the specific document name for fixed corporate sets */}
      <Dropdown value={type} options={options} onChange={onType} disabled={locked || isFixed} disabledOptions={disabledOptions} />

      {verified ? (
        <>
          <DocThumb label={type} onView={() => onView(type, fileName)} />
          <div className="flex items-center justify-between gap-3 -mt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-[18px] h-[18px] text-fg-tertiary shrink-0" strokeWidth={1.75} />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[14px] font-medium text-fg-primary truncate">{fileName}</span>
                <span className="text-[12px] text-fg-tertiary">240 KB</span>
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
        </>
      ) : slot.status === "idle" ? (
        <Dropzone title="Capture or upload" hint="JPG / PNG / PDF · max 10 MB" onPick={slot.start} dense />
      ) : (
        <ProcessingTile status={slot.status} label="document" dense />
      )}
    </div>
  );
}

export function BusinessProofScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const directors = (location.state as { directors?: string[] } | null)?.directors;
  const signatory = (location.state as { signatory?: string } | null)?.signatory;
  const isCorporate = entity === "llp" || entity === "ltd";
  const corpDocs = CORP_DOCS[entity] ?? null;
  const totalDocs = corpDocs ? corpDocs.length : 2;

  // Hooks must be unconditional; create the max number of slots and slice.
  const slot0 = useUpload("verified");
  const slot1 = useUpload("idle");
  const slot2 = useUpload("idle");
  const slot3 = useUpload("idle");

  const [types, setTypes] = useState<string[]>(() => (corpDocs ? corpDocs.map((c) => c.title) : [docTypes[0], docTypes[3]]));
  const [viewer, setViewer] = useState<{ label: string; meta: string } | null>(null);

  const slots = [slot0, slot1, slot2, slot3].slice(0, totalDocs);
  const added = slots.filter((s) => s.status === "verified").length;
  const ready = added >= totalDocs;

  const slotConfigs = corpDocs ?? Array.from({ length: totalDocs }, (_, i) => ({ title: `BUSINESS DOCUMENT ${i + 1}`, subtext: "" }));

  const setType = (i: number, v: string) => setTypes((prev) => prev.map((t, idx) => (idx === i ? v : t)));

  return (
    <Screen
      header={
        <StepHeader 
          step="STEP 3 OF 9" 
          title="Business proof" 
          progress={33} 
          onBack={() => navigate(-1)}
        />
      }
      footer={
        <BottomBar>
          {!ready ? <p className="text-center text-[13px] text-fg-tertiary mb-2.5">{totalDocs - added} more document needed</p> : null}
          <Button
            full
            variant="dark"
            disabled={!ready}
            onClick={() => navigate(entity === "ltd" ? "/shareholding" : "/self-declaration", { state: { entity, directors, signatory } })}
            rightIcon={ready ? <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} /> : undefined}
          >
            {ready ? "Verify & continue" : `Add ${totalDocs - added} more to continue`}
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold tracking-tight text-fg-primary">
            {entity === "ltd"
              ? "Upload corporate documents for the company"
              : entity === "llp"
                ? "Upload corporate documents for the LLP"
                : "Any 2 documents in the firm's name"}
          </h2>
          <p className="text-[14px] text-fg-tertiary">
            {isCorporate ? "Attach each required document below." : "Each must be a different document type."}
          </p>
        </div>

        <ProgressMeter done={added} total={totalDocs} verb="added" />

        <div className="flex flex-col gap-4">
          {slots.map((slot, i) => (
            <DocSlot
              key={i}
              index={i}
              type={types[i]}
              slot={slot}
              disabledOptions={isCorporate ? [] : types.filter((_, idx) => idx !== i)}
              onType={(v) => setType(i, v)}
              onView={(label, meta) => setViewer({ label, meta })}
              title={slotConfigs[i].title}
              subtext={slotConfigs[i].subtext}
              options={isCorporate ? [slotConfigs[i].title] : docTypes}
              isFixed={isCorporate}
            />
          ))}
        </div>
      </div>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ""} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </Screen>
  );
}
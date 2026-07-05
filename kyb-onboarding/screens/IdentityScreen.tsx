import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, RotateCcw, Info, ShieldCheck, Trash2, ArrowRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { DocThumb } from "../components/DocImage";
import { DocViewer } from "../components/DocViewer";
import { Dropzone, ProcessingTile } from "../components/UploadTile";
import { useUpload } from "../lib/useUpload";

const ovds = ["Passport", "Driving licence", "Voter ID"];

export function IdentityScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"aadhaar" | "ovd">("ovd");
  const [ovd, setOvd] = useState("Driving licence");
  const [aadhaarFetched, setAadhaarFetched] = useState(false);
  const panUpload = useUpload("verified");
  const ovdUpload = useUpload("idle");
  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);

  const addressDone = tab === "aadhaar" ? aadhaarFetched : ovdUpload.status === "verified";

  return (
    <Screen
      header={<StepHeader step="STEP 2 OF 9" title="Identity & address" progress={22} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button
            full
            variant="dark"
            disabled={!addressDone}
            onClick={() => navigate("/business-proof")}
            rightIcon={addressDone ? <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} /> : undefined}
          >
            {addressDone ? "Verify & continue" : "Add address proof to continue"}
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        {/* PAN */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">PAN</span>
          <div
            className={["rounded-xl border bg-surface-card p-4 flex flex-col gap-3.5", panUpload.status === "verified" ? "border-pos-border" : "border-line-subtle"].join(" ")}
            style={{ boxShadow: "var(--shadow-xs)" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-fg-secondary" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[16px] font-semibold text-fg-primary leading-tight">PAN card</span>
                <span className="text-[13px] font-mono text-fg-tertiary mt-0.5">BNZPM2501F</span>
              </div>
              {panUpload.status === "verified" ? <StatusBadge kind="verified" /> : panUpload.status === "verifying" ? <StatusBadge kind="verifying" /> : null}
            </div>
            {panUpload.status === "verified" ? (
              <>
                <DocThumb label="PAN card" onView={() => setViewer({ label: "PAN card", meta: "BNZPM2501F" })} />
                <button
                  type="button"
                  onClick={panUpload.reset}
                  className="self-start inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-10 text-[14px] font-medium text-fg-primary hover:bg-surface-hover transition-colors"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2} />
                  Retake
                </button>
              </>
            ) : panUpload.status === "idle" ? (
              <Dropzone title="Capture or upload PAN" hint="Use camera or pick a file · JPG / PDF" onPick={panUpload.start} dense />
            ) : (
              <ProcessingTile status={panUpload.status} label="PAN" dense />
            )}
          </div>
        </div>

        {/* Address proof */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">ADDRESS PROOF</span>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand">
              <Info className="w-3.5 h-3.5" strokeWidth={2} />
              any one
            </span>
          </div>
          <p className="text-[14px] text-fg-tertiary -mt-1">Pick one: fetch Aadhaar via DigiLocker, or upload an officially valid document.</p>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-sunken">
            <button
              type="button"
              onClick={() => setTab("aadhaar")}
              className={[
                "h-11 rounded-lg text-[14px] font-semibold transition-colors px-2",
                tab === "aadhaar" ? "bg-surface-card text-fg-primary" : "text-fg-tertiary",
              ].join(" ")}
              style={tab === "aadhaar" ? { boxShadow: "var(--shadow-xs)" } : undefined}
            >
              Aadhaar (DigiLocker)
            </button>
            <button
              type="button"
              onClick={() => setTab("ovd")}
              className={[
                "h-11 rounded-lg text-[14px] font-semibold transition-colors px-2",
                tab === "ovd" ? "bg-surface-card text-fg-primary" : "text-fg-tertiary",
              ].join(" ")}
              style={tab === "ovd" ? { boxShadow: "var(--shadow-xs)" } : undefined}
            >
              Upload OVD
            </button>
          </div>

          {tab === "aadhaar" ? (
            aadhaarFetched ? (
              <div className="rounded-xl border border-pos-border bg-surface-card p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
                <ShieldCheck className="w-5 h-5 text-pos shrink-0" strokeWidth={2} />
                <div className="flex flex-col flex-1">
                  <span className="text-[15px] font-semibold text-fg-primary">Aadhaar fetched</span>
                  <span className="text-[13px] text-fg-tertiary font-mono">xxxx xxxx 1234</span>
                </div>
                <StatusBadge kind="verified" />
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-surface-card p-4 flex flex-col gap-3.5" style={{ boxShadow: "var(--shadow-xs)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-selected flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-brand" strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-fg-primary leading-tight">Aadhaar via DigiLocker</span>
                    <span className="text-[13px] text-fg-tertiary mt-0.5">Consent-based, paperless fetch</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAadhaarFetched(true)}
                  className="w-full h-12 rounded-lg border border-line bg-surface-card text-[15px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
                >
                  Fetch from DigiLocker
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                {ovds.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOvd(o)}
                    disabled={ovdUpload.status !== "idle"}
                    className={[
                      "h-11 rounded-lg border text-[13px] font-semibold transition-colors px-1",
                      ovd === o ? "border-fg-primary bg-fg-primary text-surface-card" : "border-line bg-surface-card text-fg-primary hover:bg-surface-hover",
                    ].join(" ")}
                  >
                    {o}
                  </button>
                ))}
              </div>

              {ovdUpload.status === "verified" ? (
                <div className="rounded-xl border border-pos-border bg-surface-card p-4 flex flex-col gap-3.5" style={{ boxShadow: "var(--shadow-xs)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-fg-primary">{ovd}</span>
                    <StatusBadge kind="verified" />
                  </div>
                  <DocThumb label={ovd} onView={() => setViewer({ label: ovd, meta: `${ovd.split(" ")[0].toLowerCase()}_proof.pdf` })} />
                  <button
                    type="button"
                    onClick={ovdUpload.reset}
                    aria-label="Remove document"
                    className="self-start inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-3 h-9 text-[13px] font-semibold text-neg hover:bg-surface-hover transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                    Remove
                  </button>
                </div>
              ) : ovdUpload.status === "idle" ? (
                <Dropzone title={`Capture or upload ${ovd}`} hint="Use camera or pick a file · JPG / PDF" onPick={ovdUpload.start} />
              ) : (
                <ProcessingTile status={ovdUpload.status} label={ovd} />
              )}
            </div>
          )}
        </div>
      </div>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ""} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </Screen>
  );
}

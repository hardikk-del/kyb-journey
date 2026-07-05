import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { ProgressMeter } from "../components/ProgressMeter";
import { Dropdown } from "../components/Dropdown";
import { StatusBadge } from "../components/StatusBadge";
import { DocThumb } from "../components/DocImage";
import { DocViewer } from "../components/DocViewer";
import { Dropzone, ProcessingTile } from "../components/UploadTile";
import { useUpload } from "../lib/useUpload";
import { assetFor } from "../lib/docAssets";
import { ENTITY_META, membersFor, membersInfoFor, type EntityMeta, type MemberInfo } from "../lib/entities";

type Method = "manual" | "link";
type KycState = "idle" | "sent" | "progress" | "verified";

export function DirectorKycScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { entity?: string; directors?: string[]; signatory?: string } | null;
  const entity = state?.entity ?? "ltd";
  const directors = state?.directors ?? membersFor(entity);
  const meta = ENTITY_META[entity as keyof typeof ENTITY_META];
  const info = membersInfoFor(entity);
  const infoFor = (name: string): MemberInfo | undefined => info.find((m) => m.name === name);

  // RM designates the authorised signatory here (relocated from entity-details).
  const [signatory, setSignatory] = useState(state?.signatory ?? directors[0]);

  // Default: the authorised signatory (RM is with them) does manual on-device
  // KYC; the remaining directors receive a secure link. RM can change any of them.
  const [methods, setMethods] = useState<Record<string, Method>>(() =>
    directors.reduce((acc, d) => ({ ...acc, [d]: d === (state?.signatory ?? directors[0]) ? "manual" : "link" }), {}),
  );
  const [phones, setPhones] = useState<Record<string, string>>(() =>
    directors.reduce((acc, d) => ({ ...acc, [d]: "" }), {}),
  );

  const [dispatched, setDispatched] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, KycState>>({});
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const setMethod = (d: string, m: Method) => setMethods((prev) => ({ ...prev, [d]: m }));
  const setPhone = (d: string, val: string) =>
    setPhones((prev) => ({ ...prev, [d]: val.replace(/\D/g, "").slice(0, 10) }));

  // Every director set to "link" needs a valid 10-digit number before dispatch.
  const linkReady = directors.every((d) => methods[d] !== "link" || phones[d]?.length === 10);

  const dispatch = () => {
    // Link directors start as "sent"; manual directors report in from their card.
    const init: Record<string, KycState> = {};
    directors.forEach((d) => {
      init[d] = methods[d] === "link" ? "sent" : "idle";
    });
    setStatuses(init);
    setDispatched(true);

    // Simulate the dispatched links moving through the remote flow, staggered.
    const linkDirectors = directors.filter((d) => methods[d] === "link");
    linkDirectors.forEach((d, i) => {
      timers.current.push(
        setTimeout(() => setStatuses((p) => ({ ...p, [d]: "progress" })), 3000 + i * 1800),
      );
      timers.current.push(
        setTimeout(() => setStatuses((p) => ({ ...p, [d]: "verified" })), 8000 + i * 1800),
      );
    });
  };

  const markVerified = (d: string) => setStatuses((p) => ({ ...p, [d]: "verified" }));

  const verifiedCount = directors.filter((d) => statuses[d] === "verified").length;
  const allClear = dispatched && verifiedCount === directors.length;

  return (
    <Screen
      header={
        <StepHeader
          step="STEP 1.5 OF 9"
          title={allClear ? "Director KYC complete" : dispatched ? "Awaiting director KYC" : "Director KYC"}
          progress={18}
          onBack={() => (dispatched ? setDispatched(false) : navigate(-1))}
        />
      }
      footer={
        <BottomBar>
          {dispatched ? (
            <>
              {!allClear ? (
                <div className="flex items-center justify-center gap-2 mb-3 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 text-warning-fg animate-spin" />
                  <p className="text-center text-[13px] text-warning-fg font-medium">
                    Waiting for {directors.length - verifiedCount} director KYC…
                  </p>
                </div>
              ) : null}
              <Button
                full
                variant="dark"
                disabled={!allClear}
                onClick={() => navigate("/checklist", { state: { entity, directors, signatory } })}
                rightIcon={allClear ? <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} /> : undefined}
              >
                {allClear ? "Continue to documents" : "Waiting for director inputs"}
              </Button>
            </>
          ) : (
            <Button
              full
              variant="dark"
              disabled={!linkReady}
              onClick={dispatch}
              rightIcon={<ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}
            >
              Dispatch &amp; start KYC
            </Button>
          )}
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-6">
        {dispatched ? (
          <>
            <ProgressMeter done={verifiedCount} total={directors.length} verb="verified" />
            <div className="flex flex-col gap-3.5">
              {directors.map((d) =>
                methods[d] === "link" ? (
                  <LinkTrackCard
                    key={d}
                    name={d}
                    isSignatory={d === signatory}
                    status={statuses[d] ?? "sent"}
                    onPreview={() => setPreviewFor(d)}
                  />
                ) : (
                  <ManualCaptureCard
                    key={d}
                    name={d}
                    isSignatory={d === signatory}
                    verified={statuses[d] === "verified"}
                    onVerified={() => markVerified(d)}
                  />
                ),
              )}
            </div>
          </>
        ) : (
          <>
            {/* Firm details extracted from PAN + CIN via MCA */}
            {meta ? <McaFirmBlock meta={meta} /> : null}

            <div className="flex flex-col gap-1.5">
              <h2 className="text-[17px] font-semibold tracking-tight text-fg-primary">
                Complete KYC for each director
              </h2>
              <p className="text-[14px] text-fg-tertiary">
                Capture a director's identity &amp; address on this device, or send them a secure
                collection link over WhatsApp &amp; SMS.
              </p>
            </div>

            {/* Authorised signatory designation (relocated from entity-details) */}
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-fg-secondary">
                Authorised signatory <span className="text-neg">*</span>
              </span>
              <Dropdown value={signatory} options={directors} onChange={setSignatory} placeholder="Select authorised signatory" />
              <span className="text-[12.5px] text-fg-tertiary leading-snug">
                The director named in the Board Resolution who will operate the current account.
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {directors.map((d) => (
                <SetupCard
                  key={d}
                  name={d}
                  address={infoFor(d)?.address}
                  dob={infoFor(d)?.dob}
                  isSignatory={d === signatory}
                  method={methods[d]}
                  phone={phones[d] ?? ""}
                  onMethod={(m) => setMethod(d, m)}
                  onPhone={(v) => setPhone(d, v)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {previewFor ? (
        <DirectorPreview name={previewFor} info={infoFor(previewFor)} onClose={() => setPreviewFor(null)} />
      ) : null}
    </Screen>
  );
}

/* ---------- MCA firm extraction ---------- */

function McaFirmBlock({ meta }: { meta: EntityMeta }) {
  const rows: [string, string | undefined][] = [
    ["PAN", meta.pan],
    ["CIN", meta.cin],
    ["Date of incorporation", meta.dateOfIncorporation],
    ["Registered office", meta.registeredOffice],
    ["Registrar", meta.roc],
  ];
  return (
    <div className="rounded-xl border border-pos-border bg-surface-card overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line-subtle bg-pos-bg">
        <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-pos-fg" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[14px] font-bold text-fg-primary leading-tight truncate">{meta.legalName}</span>
          <span className="text-[12px] text-fg-tertiary">Fetched from MCA · {meta.status ?? "Active"}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pos-fg bg-surface-card px-2 h-6 rounded-full shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} /> Verified
        </span>
      </div>
      <div className="px-4 py-1">
        {rows.filter(([, v]) => v).map(([k, v], i, arr) => (
          <div key={k} className={["flex flex-col gap-0.5 py-2.5", i === arr.length - 1 ? "" : "border-b border-line-subtle"].join(" ")}>
            <span className="text-[12px] font-medium text-fg-tertiary">{k}</span>
            <span className="text-[13.5px] font-semibold text-fg-primary leading-snug">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- setup ---------- */

function SetupCard({
  name,
  address,
  dob,
  isSignatory,
  method,
  phone,
  onMethod,
  onPhone,
}: {
  name: string;
  address?: string;
  dob?: string;
  isSignatory: boolean;
  method: Method;
  phone: string;
  onMethod: (m: Method) => void;
  onPhone: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface-card p-4 shadow-xs">
      <div className="flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-brand" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] font-bold text-fg-primary leading-tight">{name}</span>
          {isSignatory ? (
            <span className="text-[11px] font-semibold tracking-[0.04em] text-brand">AUTHORISED SIGNATORY</span>
          ) : (
            <span className="text-[12px] text-fg-tertiary">Director</span>
          )}
          {dob ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-fg-tertiary mt-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              DOB · {dob}
            </span>
          ) : null}
          {address ? (
            <span className="inline-flex items-start gap-1 text-[12px] text-fg-tertiary mt-0.5 leading-snug">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
              {address}
            </span>
          ) : null}
        </div>
      </div>

      {/* method segmented toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-sunken">
        {(
          [
            { id: "manual", label: "Manual upload", icon: Upload },
            { id: "link", label: "Send link", icon: MessageCircle },
          ] as const
        ).map((m) => {
          const active = method === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onMethod(m.id)}
              className={[
                "h-10 rounded-md text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors",
                active ? "bg-surface-card text-fg-primary" : "text-fg-tertiary",
              ].join(" ")}
              style={active ? { boxShadow: "var(--shadow-xs)" } : undefined}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {m.label}
            </button>
          );
        })}
      </div>

      {method === "link" ? (
        <div className="flex items-center gap-2.5 h-12 px-3.5 rounded-lg border border-line bg-surface-card focus-within:border-brand transition-colors anim-fade">
          <span className="w-6 h-4 rounded-sm overflow-hidden flex flex-col shrink-0">
            <span className="flex-1 bg-[#FF9933]" />
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#138808]" />
          </span>
          <span className="text-[15px] font-semibold text-fg-primary">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="Enter 10-digit number"
            className="flex-1 bg-transparent text-[15px] text-fg-primary outline-none tracking-wider"
          />
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg bg-surface-sunken px-3 py-2.5 anim-fade">
          <Camera className="w-4 h-4 text-fg-tertiary mt-0.5 shrink-0" strokeWidth={2} />
          <span className="text-[13px] text-fg-tertiary leading-snug">
            You'll capture their PAN, Aadhaar (DigiLocker) &amp; a live selfie on this device.
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- tracking: link director ---------- */

function CardShell({ children, tone }: { children: React.ReactNode; tone: "verified" | "progress" | "idle" }) {
  const border = tone === "verified" ? "border-pos-border" : tone === "progress" ? "border-warning" : "border-line-subtle";
  return (
    <div className={["rounded-xl border bg-surface-card p-4 flex flex-col gap-3 transition-all duration-500", border].join(" ")} style={{ boxShadow: "var(--shadow-xs)" }}>
      {children}
    </div>
  );
}

function CardHead({ name, sub, status }: { name: string; sub: string; status: KycState }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            status === "verified" ? "bg-pos" : status === "progress" ? "bg-warning animate-ping" : "bg-fg-tertiary"
          }`}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-[16px] font-semibold text-fg-primary leading-tight truncate">{name}</span>
          <span className="text-[11px] font-medium text-fg-tertiary">{sub}</span>
        </div>
      </div>
      {status === "verified" ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-pos-fg bg-pos-bg px-2.5 h-6 rounded-full shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
        </span>
      ) : status === "progress" ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-warning-fg bg-warning/10 px-2.5 h-6 rounded-full shrink-0">
          Verifying…
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-fg-tertiary bg-surface-sunken px-2.5 h-6 rounded-full shrink-0">
          Link delivered
        </span>
      )}
    </div>
  );
}

function LinkTrackCard({
  name,
  isSignatory,
  status,
  onPreview,
}: {
  name: string;
  isSignatory: boolean;
  status: KycState;
  onPreview: () => void;
}) {
  const tone = status === "verified" ? "verified" : status === "progress" ? "progress" : "idle";
  return (
    <CardShell tone={tone}>
      <CardHead name={name} sub={`${isSignatory ? "Authorised signatory" : "Director"} · Link`} status={status} />

      {status === "sent" ? (
        <div className="flex items-center gap-2 text-[13px] text-fg-tertiary border-t border-line/40 pt-2.5 mt-0.5">
          <MessageCircle className="w-4 h-4 text-pos shrink-0" />
          <span>Secure link delivered via WhatsApp &amp; SMS · awaiting the director</span>
        </div>
      ) : status === "progress" ? (
        <div className="flex flex-col gap-2 border-t border-line/40 pt-2.5 mt-0.5">
          <div className="flex items-center gap-2 text-[13px] text-brand font-medium">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={2} />
            Running PAN verification and Aadhaar KYC…
          </div>
          <div className="rounded-lg bg-surface-selected px-3 py-2 flex items-center gap-2 text-[12px] text-brand font-medium border border-brand/10">
            <ShieldCheck className="w-3.5 h-3.5 animate-bounce" />
            Director is performing real-time Aadhaar Liveness match…
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 border-t border-line/40 pt-3 mt-0.5">
          <div className="flex items-center gap-2 text-[13px] text-pos-fg">
            <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
            PAN &amp; Aadhaar KYC verified · face matched
          </div>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-line bg-surface-card text-[14px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
            Preview KYC
          </button>
        </div>
      )}
    </CardShell>
  );
}

/* ---------- tracking: manual director (prop-style capture) ---------- */

const OVDS = ["Passport", "Driving licence", "Voter ID"];

function ManualCaptureCard({
  name,
  isSignatory,
  verified,
  onVerified,
}: {
  name: string;
  isSignatory: boolean;
  verified: boolean;
  onVerified: () => void;
}) {
  const pan = useUpload("idle");
  const ovd = useUpload("idle");
  const selfie = useUpload("idle");
  const [aadhaarTab, setAadhaarTab] = useState<"digilocker" | "ovd">("digilocker");
  const [aadhaarFetched, setAadhaarFetched] = useState(false);
  const [ovdType, setOvdType] = useState("Driving licence");
  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);

  const aadhaarDone = aadhaarTab === "digilocker" ? aadhaarFetched : ovd.status === "verified";
  const done = pan.status === "verified" && aadhaarDone && selfie.status === "verified";

  const reported = useRef(false);
  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onVerified();
    }
  }, [done, onVerified]);

  const status: KycState = verified || done ? "verified" : "progress";

  return (
    <CardShell tone={status === "verified" ? "verified" : "progress"}>
      <CardHead name={name} sub={`${isSignatory ? "Authorised signatory" : "Director"} · Manual`} status={status} />

      <div className="flex flex-col gap-3 border-t border-line/40 pt-3 mt-0.5">
        {/* PAN */}
        <CaptureSlot label="PAN card" done={pan.status === "verified"}>
          {pan.status === "verified" ? (
            <VerifiedDoc label="PAN card" meta="pan_card.pdf" onView={() => setViewer({ label: "PAN card", meta: "pan_card.pdf" })} onRemove={pan.reset} />
          ) : pan.status === "idle" ? (
            <Dropzone title="Capture or upload PAN" hint="Camera or file · JPG / PDF" onPick={pan.start} dense />
          ) : (
            <ProcessingTile status={pan.status} label="PAN" dense />
          )}
        </CaptureSlot>

        {/* Aadhaar — DigiLocker | OVD */}
        <CaptureSlot label="Aadhaar" done={aadhaarDone}>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-sunken mb-2.5">
            {(
              [
                { id: "digilocker", label: "DigiLocker" },
                { id: "ovd", label: "OVD" },
              ] as const
            ).map((t) => {
              const active = aadhaarTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAadhaarTab(t.id)}
                  className={["h-9 rounded-md text-[13px] font-semibold transition-colors", active ? "bg-surface-card text-fg-primary" : "text-fg-tertiary"].join(" ")}
                  style={active ? { boxShadow: "var(--shadow-xs)" } : undefined}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {aadhaarTab === "digilocker" ? (
            aadhaarFetched ? (
              <div className="rounded-lg border border-pos-border bg-surface-card p-3 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-pos shrink-0" strokeWidth={2} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-fg-primary">Aadhaar fetched</span>
                  <span className="text-[12px] text-fg-tertiary font-mono">xxxx xxxx 1234</span>
                </div>
                <StatusBadge kind="verified" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAadhaarFetched(true)}
                className="w-full h-11 rounded-lg border border-line bg-surface-card text-[14px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-brand" strokeWidth={2} />
                Fetch from DigiLocker
              </button>
            )
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-2">
                {OVDS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOvdType(o)}
                    disabled={ovd.status !== "idle"}
                    className={["h-10 rounded-lg border text-[12px] font-semibold transition-colors px-1", ovdType === o ? "border-fg-primary bg-fg-primary text-surface-card" : "border-line bg-surface-card text-fg-primary hover:bg-surface-hover"].join(" ")}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {ovd.status === "verified" ? (
                <VerifiedDoc label={ovdType} meta={`${ovdType.split(" ")[0].toLowerCase()}_proof.pdf`} onView={() => setViewer({ label: ovdType, meta: `${ovdType.split(" ")[0].toLowerCase()}_proof.pdf` })} onRemove={ovd.reset} />
              ) : ovd.status === "idle" ? (
                <Dropzone title={`Capture or upload ${ovdType}`} hint="Camera or file · JPG / PDF" onPick={ovd.start} dense />
              ) : (
                <ProcessingTile status={ovd.status} label={ovdType} dense />
              )}
            </div>
          )}
        </CaptureSlot>

        {/* Selfie — inline capture */}
        <CaptureSlot label="Live selfie" done={selfie.status === "verified"}>
          {selfie.status === "verified" ? (
            <div className="flex items-center gap-3 rounded-lg border border-pos-border bg-surface-card p-2.5">
              <img src={assetFor("selfie")} alt="Selfie" className="w-12 h-12 rounded-lg object-cover object-top bg-surface-sunken shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[14px] font-semibold text-fg-primary">Selfie captured</span>
                <span className="text-[12px] text-fg-tertiary">Liveness passed · face matched</span>
              </div>
              <StatusBadge kind="verified" />
            </div>
          ) : selfie.status === "idle" ? (
            <button
              type="button"
              onClick={selfie.start}
              className="w-full h-11 rounded-lg border border-line bg-surface-card text-[14px] font-semibold text-fg-primary hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" strokeWidth={2} />
              Capture selfie
            </button>
          ) : (
            <ProcessingTile status={selfie.status} label="selfie" dense />
          )}
        </CaptureSlot>
      </div>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ""} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </CardShell>
  );
}

function CaptureSlot({ label, done, children }: { label: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={["w-5 h-5 rounded-full flex items-center justify-center shrink-0", done ? "bg-pos text-surface-card" : "bg-surface-sunken text-fg-tertiary"].join(" ")}>
          {done ? <Check className="w-3 h-3" strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-fg-tertiary" />}
        </span>
        <span className="text-[12px] font-semibold tracking-[0.06em] text-fg-tertiary uppercase">{label}</span>
      </div>
      {children}
    </div>
  );
}

function VerifiedDoc({ label, meta, onView, onRemove }: { label: string; meta: string; onView: () => void; onRemove: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <DocThumb label={label} onView={onView} />
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-fg-tertiary truncate">{meta}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove document"
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-card px-2.5 h-8 text-[12px] font-semibold text-neg hover:bg-surface-hover transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          Remove
        </button>
      </div>
    </div>
  );
}

/* ---------- link preview modal ---------- */

function DirectorPreview({ name, info, onClose }: { name: string; info?: MemberInfo; onClose: () => void }) {
  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);
  const details: [string, string | undefined][] = [
    ["Name", name],
    ["Date of birth", info?.dob],
    ["PAN", info?.pan],
    ["Aadhaar", info?.aadhaar],
    ["Address", info?.address],
  ];
  const docs: { label: string; meta: string }[] = [
    { label: "PAN card", meta: "pan_card.pdf" },
    { label: "Aadhaar", meta: "aadhaar.pdf" },
    { label: "Selfie", meta: "Live capture" },
  ];
  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col anim-fade">
      <div className="shrink-0 flex items-center justify-between px-5 h-14 bg-surface-card border-b border-line-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[15px] font-bold text-fg-primary truncate">{name} · KYC</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pos-fg bg-pos-bg px-2 h-6 rounded-full shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close preview" className="w-8 h-8 -mr-1.5 rounded-full flex items-center justify-center text-fg-secondary hover:bg-surface-hover transition-colors">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex flex-col gap-5">
        {/* Extracted details */}
        <div className="rounded-xl border border-line bg-surface-card p-4 flex flex-col gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">EXTRACTED DETAILS</span>
          {details.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
              <span className="text-[13px] text-fg-tertiary shrink-0">{k}</span>
              <span className="text-[13.5px] font-semibold text-fg-primary text-right leading-snug">{v}</span>
            </div>
          ))}
        </div>

        {/* Document cards */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">DOCUMENTS</span>
          {docs.map((d) => (
            <div key={d.label} className="rounded-xl border border-line-subtle bg-surface-card p-3 flex flex-col gap-2" style={{ boxShadow: "var(--shadow-xs)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-fg-primary">{d.label}</span>
                <StatusBadge kind="verified" />
              </div>
              <DocThumb label={d.label} onView={() => setViewer({ label: d.label, meta: d.meta })} />
            </div>
          ))}
        </div>
      </div>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ""} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </div>
  );
}

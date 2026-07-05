import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap, RotateCw, Check, Camera, Lock, ScanFace, RefreshCw } from "lucide-react";

const FEED =
  "https://d1kwhi236ua7t6.cloudfront.net/6142cad6-1cb6-4299-bba0-8a52f16313fa/projects/d4245685-58c8-4fa3-97b0-00b0205930ba/attachments/image%20%281%29.png";

type Phase = "searching" | "aligned" | "captured";

export function SelfieCaptureScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("searching");
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Simulate face detection: searching → aligned after a short beat.
  useEffect(() => {
    if (phase !== "searching") return;
    timer.current = setTimeout(() => setPhase("aligned"), 2400);
    return () => clearTimeout(timer.current);
  }, [phase]);

  const capture = () => {
    if (phase !== "aligned") return;
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    setPhase("captured");
  };

  const ovalColor = phase === "aligned" ? "#16a34a" : phase === "captured" ? "#16a34a" : "#f5a623";

  return (
    <div className="relative flex flex-col h-full bg-[#0b0f1a] text-white overflow-hidden select-none">
      {/* Top bar */}
      <div className="relative z-20 flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => navigate("/identity")}
          aria-label="Back"
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <div className="flex flex-col leading-tight">
          <span className="text-[16px] font-semibold tracking-tight">Selfie verification</span>
          <span className="text-[12px] text-white/55">Capturing for · Ravi Kumar</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="relative z-20 px-6 pb-2 text-center">
        <p className="text-[13.5px] text-white/65">
          Ask the customer to look straight into the camera and hold still.
        </p>
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 min-h-0">
        <img src={FEED} alt="Camera feed" className="absolute inset-0 w-full h-full object-cover" />
        {/* focus vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 46% 30% at 50% 45%, rgba(11,15,26,0) 58%, rgba(11,15,26,0.82) 100%)" }}
        />

        {/* Oval guide */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "6%" }}>
          <div className="relative" style={{ width: 244, height: 312 }}>
            {/* pulsing halo while searching */}
            {phase === "searching" ? (
              <div
                className="absolute -inset-1.5 rounded-[50%] animate-ping"
                style={{ border: "2px solid rgba(245,166,35,0.45)", animationDuration: "1.8s" }}
              />
            ) : null}
            <div
              className="absolute inset-0 rounded-[50%] transition-colors duration-300"
              style={{ border: `4px solid ${ovalColor}`, boxShadow: `0 0 0 9999px rgba(11,15,26,0)` }}
            />
            {/* aligned check badge */}
            {phase !== "searching" ? (
              <div
                className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#16a34a" }}
              >
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Status hint pill */}
        <div className="absolute left-0 right-0 bottom-6 flex justify-center px-6">
          {phase === "searching" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-4 h-10 text-[14px] font-medium text-[#fbbf24]">
              <ScanFace className="w-4 h-4" strokeWidth={2} />
              Position the face inside the oval
            </span>
          ) : phase === "aligned" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-4 h-10 text-[14px] font-semibold text-[#4ade80]">
              <Check className="w-4 h-4" strokeWidth={2.5} />
              Face detected, hold still
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-4 h-10 text-[14px] font-semibold text-[#4ade80]">
              <Check className="w-4 h-4" strokeWidth={2.5} />
              Photo captured
            </span>
          )}
        </div>

        {/* capture flash */}
        {flash ? <div className="absolute inset-0 bg-white" style={{ opacity: 0.85 }} /> : null}
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 px-6 pt-5 pb-7">
        {phase === "captured" ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/business-docs")}
              className="w-full h-13 rounded-xl bg-white text-[#0b0f1a] inline-flex items-center justify-center gap-2 text-[15px] font-semibold py-3.5 hover:bg-white/90 transition-colors"
            >
              <Check className="w-[18px] h-[18px]" strokeWidth={2.5} />
              Use this photo
            </button>
            <button
              type="button"
              onClick={() => setPhase("searching")}
              className="w-full h-12 rounded-xl border border-white/20 text-white inline-flex items-center justify-center gap-2 text-[15px] font-semibold py-3 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-[18px] h-[18px]" strokeWidth={2} />
              Retake
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Toggle flash"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors"
            >
              <Zap className="w-5 h-5" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={capture}
              disabled={phase !== "aligned"}
              aria-label="Capture selfie"
              className="relative w-[74px] h-[74px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{
                border: `3px solid ${phase === "aligned" ? "#16a34a" : "rgba(255,255,255,0.4)"}`,
              }}
            >
              <span
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center transition-colors"
                style={{ background: phase === "aligned" ? "#16a34a" : "rgba(255,255,255,0.35)" }}
              >
                <Camera className="w-6 h-6 text-white" strokeWidth={2} />
              </span>
            </button>

            <button
              type="button"
              aria-label="Flip camera"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors"
            >
              <RotateCw className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
          <Lock className="w-3 h-3" strokeWidth={2} />
          Encrypted · matched against PAN &amp; address proof
        </div>
      </div>
    </div>
  );
}

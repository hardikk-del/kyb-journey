import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";
import { ProgressMeter } from "../components/ProgressMeter";

type TrackState = "sent" | "progress" | "verified";

export function PartnerTrackingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "llp";
  const partners = (location.state as { partners?: string[] } | null)?.partners ?? ["Ravi Kumar", "Rahul Mishra"];

  // Mocking live webhook states for each partner
  const [statuses, setStatuses] = useState<Record<string, TrackState>>(() => 
    partners.reduce((acc, p) => ({ ...acc, [p]: p === "Ravi Kumar" ? "verified" : "sent" }), {})
  );

  // Simulation side-effect to turn Partner 2 from Sent -> In Progress -> Verified automatically
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatuses(prev => ({ ...prev, [partners[1]]: "progress" }));
    }, 4000);

    const timer2 = setTimeout(() => {
      setStatuses(prev => ({ ...prev, [partners[1]]: "verified" }));
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [partners]);

  const verifiedCount = partners.filter(p => statuses[p] === "verified").length;
  const allClear = verifiedCount === partners.length;

  return (
    <Screen
      header={
        <StepHeader 
          step="STEP 2 OF 9" 
          title={allClear ? "Verifications complete" : "Awaiting partner KYC"} 
          progress={22} 
          onBack={() => navigate(-1)}
        />
      }
      footer={
        <BottomBar>
          {!allClear ? (
            <div className="flex items-center justify-center gap-2 mb-3 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 text-warning-fg animate-spin" />
              <p className="text-center text-[13px] text-warning-fg font-medium">Waiting for {partners.length - verifiedCount} partner KYC...</p>
            </div>
          ) : null}
          <Button
            full
            variant="dark"
            disabled={!allClear}
            onClick={() => navigate("/business-docs", { state: { entity } })}
            rightIcon={allClear ? <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} /> : undefined}
          >
            {allClear ? "Proceed to Corporate Documents" : "Waiting for remote inputs"}
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-6">
        <ProgressMeter done={verifiedCount} total={partners.length} verb="verified" />

        <div className="flex flex-col gap-3.5">
          {partners.map((partner) => {
            const currentStatus = statuses[partner];
            
            // Layout styling configuration mapping based on active webhook state
            const borderStyle = currentStatus === "verified" 
              ? "border-pos-border bg-surface-card" 
              : currentStatus === "progress" 
                ? "border-warning bg-surface-card" 
                : "border-line-subtle bg-surface-card";

            return (
              <div 
                key={partner} 
                className={["rounded-xl border p-4 flex flex-col gap-3 transition-all duration-500", borderStyle].join(" ")}
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${currentStatus === "verified" ? "bg-pos" : currentStatus === "progress" ? "bg-warning animate-ping" : "bg-fg-tertiary"}`} />
                    <span className="text-[16px] font-semibold text-fg-primary">{partner}</span>
                  </div>
                  
                  {currentStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-pos-fg bg-pos-bg px-2.5 h-6 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : currentStatus === "progress" ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-warning-fg bg-warning/10 px-2.5 h-6 rounded-full">
                      Uploading Documents
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-fg-tertiary bg-surface-sunken px-2.5 h-6 rounded-full">
                      Link Delivered
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[13px] text-fg-tertiary border-t border-line/40 pt-2.5 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-pos shrink-0" />
                  <span>Secure gateway setup configured for active dispatch</span>
                </div>

                {currentStatus === "progress" && (
                  <div className="rounded-lg bg-surface-selected px-3 py-2 flex items-center gap-2 text-[12px] text-brand font-medium border border-brand/10">
                    <ShieldCheck className="w-3.5 h-3.5 animate-bounce" />
                    Customer is performing real-time Aadhaar Liveness match...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
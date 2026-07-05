import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Sparkles, ChevronRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  minBalance: string;
  features: string[];
  recommended?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "digital-first",
    name: "Digital First Account",
    tagline: "Best fit for a high-volume digital business",
    minBalance: "₹35,000",
    recommended: true,
    features: [
      "Unlimited UPI & digital transactions",
      "Free payment gateway setup · 1% MDR discount",
      "Automated GST payments & bulk payouts",
      "High transaction limit · ₹5L per day",
    ],
  },
  {
    id: "growth",
    name: "Growth Business Account",
    tagline: "For businesses scaling cash + trade operations",
    minBalance: "₹50,000",
    features: [
      "Unlimited UPI & digital transactions",
      "Dedicated relationship manager",
      "Free cash deposit up to ₹10L / month",
      "Priority trade & forex desk",
    ],
  },
  {
    id: "starter",
    name: "Starter Current Account",
    tagline: "Low balance commitment to begin with",
    minBalance: "₹10,000",
    features: [
      "UPI & digital transactions",
      "Standard payout limit · ₹2L per day",
      "Basic GST payment support",
    ],
  },
];

export function AccountSetupScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "prop";
  const st = location.state as { partners?: string[]; directors?: string[]; signatory?: string } | null;
  const members = st?.directors ?? st?.partners ?? ["Ravi Kumar", "Rahul Mishra"];
  const flow = { entity, partners: members, directors: members, signatory: st?.signatory };

  const [selected, setSelected] = useState<string>(PLANS.find((p) => p.recommended)?.id ?? PLANS[0].id);
  const selectedPlan = PLANS.find((p) => p.id === selected);

  return (
    <Screen
      header={<StepHeader step="STEP 7 OF 9" title="Account setup" progress={78} onBack={() => navigate(-1)} />}
      footer={
        <BottomBar>
          <Button full variant="dark" onClick={() => navigate("/signature-nominee", { state: flow })} rightIcon={<ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Continue with {selectedPlan?.name.replace(" Account", "")}
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-4">
        <p className="text-[14px] text-fg-secondary leading-relaxed">Eligible current accounts for this business.</p>

        <div className="flex flex-col gap-3">
          {PLANS.map((plan) => {
            const active = plan.id === selected;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={[
                  "w-full text-left rounded-2xl border bg-surface-card transition-colors overflow-hidden",
                  active ? "border-brand" : "border-line hover:bg-surface-hover",
                ].join(" ")}
                style={active ? { boxShadow: "var(--shadow-sm)" } : undefined}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col flex-1 min-w-0">
                      {plan.recommended ? (
                        <span className="inline-flex w-fit items-center gap-1 text-[10px] font-bold tracking-[0.06em] text-brand bg-brand-subtle rounded-md px-2 py-1 mb-2">
                          <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                          RECOMMENDED · BEST VALUE
                        </span>
                      ) : null}
                      <span className="text-[17px] font-bold tracking-tight text-fg-primary leading-tight">{plan.name}</span>
                      <span className="text-[12.5px] text-fg-tertiary mt-0.5 leading-snug">{plan.tagline}</span>
                    </div>
                    <span
                      className={[
                        "w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        active ? "border-brand bg-brand" : "border-line-strong",
                      ].join(" ")}
                    >
                      {active ? <span className="w-2 h-2 rounded-full bg-white" /> : null}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-[13px] text-fg-tertiary">Min. balance</span>
                    <span className="text-[15px] font-bold text-fg-primary">{plan.minBalance}</span>
                  </div>

                  {active ? (
                    <div className="flex flex-col gap-2 mt-3.5 pt-3.5 border-t border-line-subtle anim-fade">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5">
                          <Check className="w-[17px] h-[17px] text-pos-fg mt-0.5 shrink-0" strokeWidth={2.5} />
                          <span className="text-[13.5px] text-fg-secondary leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-3 text-[13px] font-semibold text-brand">
                      View {plan.features.length} benefits
                      <ChevronDown className="w-4 h-4" strokeWidth={2} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
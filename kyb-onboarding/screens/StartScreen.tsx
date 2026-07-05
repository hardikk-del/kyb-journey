import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Users, Scale, Home, Building2, Check, ArrowRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

const entities = [
  { id: "prop", label: "Proprietorship", icon: Store },
  { id: "partner", label: "Partnership", icon: Users },
  { id: "llp", label: "LLP", icon: Scale },
  { id: "huf", label: "HUF", icon: Home },
  { id: "ltd", label: "Pvt or Public Ltd", icon: Building2 },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-medium text-fg-secondary">{label}</span>
      <input
        defaultValue={value}
        className="h-12 px-3.5 rounded-lg border border-line bg-surface-card text-[15px] text-fg-primary focus:border-brand transition-colors"
      />
    </label>
  );
}

export function StartScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("prop");

  return (
    <Screen
      header={<StepHeader step="STEP 1 OF 9" title="New current account" progress={11} />}
      footer={
        <BottomBar>
          <Button full variant="dark" onClick={() => (selected === "prop" ? navigate("/checklist", { state: { entity: "prop" } }) : navigate("/entity-details", { state: { entity: selected } }))} rightIcon={<ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Continue
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-fg-tertiary">ENTITY TYPE</span>
          <div className="grid grid-cols-2 gap-3">
            {entities.map((e, i) => {
              const Icon = e.icon;
              const active = selected === e.id;
              const wide = i === entities.length - 1 && entities.length % 2 === 1;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelected(e.id)}
                  className={[
                    "relative rounded-xl border p-3.5 flex flex-col gap-7 text-left transition-colors",
                    wide ? "col-span-2" : "",
                    active ? "border-brand bg-surface-selected" : "border-line-subtle bg-surface-card hover:bg-surface-hover",
                  ].join(" ")}
                  style={{ boxShadow: active ? "none" : "var(--shadow-xs)" }}
                >
                  <div className="flex items-start justify-between">
                    <Icon className={["w-5 h-5", active ? "text-brand" : "text-fg-secondary"].join(" ")} strokeWidth={1.75} />
                    <span
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                        active ? "bg-brand border-brand" : "border-line-strong",
                      ].join(" ")}
                    >
                      {active ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
                    </span>
                  </div>
                  <span className={["text-[15px] font-semibold", active ? "text-brand" : "text-fg-primary"].join(" ")}>{e.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Customer name" value="Ravi Kumar" />
          <Field label="Mobile" value="+91  98200 41122" />
          <Field label="Email ID" value="ravi@kiranatraders.in" />
        </div>

      </div>
    </Screen>
  );
}

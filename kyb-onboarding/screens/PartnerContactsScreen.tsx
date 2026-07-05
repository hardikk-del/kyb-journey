import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import { Screen } from "../components/Screen";
import { StepHeader } from "../components/StepHeader";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

export function PartnerContactsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const entity = (location.state as { entity?: string } | null)?.entity ?? "llp";
  
  // Default fallback to extracted partners if state isn't provided
  const partners = (location.state as { partners?: string[] } | null)?.partners ?? [
    "Ravi Kumar",
    "Rahul Mishra"
  ];

  // Initialize phone numbers state dynamically based on number of partners
  const [phones, setPhones] = useState<Record<string, string>>(() => 
    partners.reduce((acc, partner) => ({ ...acc, [partner]: partner === "Ravi Kumar" ? "76065 12345" : "" }), {})
  );

  const handlePhoneChange = (partner: string, val: string) => {
    setPhones(prev => ({ ...prev, [partner]: val.replace(/\D/g, "").slice(0, 10) }));
  };

  // Check if all input boxes have a valid 10 digit number typed in
  const isReady = partners.every(p => phones[p]?.length === 10);

  return (
    <Screen
      header={
        <StepHeader 
          step="STEP 1.5 OF 9" 
          title="Partner contacts" 
          progress={15} 
          onBack={() => navigate(-1)}
        />
      }
      footer={
        <BottomBar>
          <Button
            full
            variant="dark"
            disabled={!isReady}
            onClick={() => navigate("/partner-tracking", { state: { entity, partners, phones } })}
            rightIcon={<ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}
          >
            Dispatch Verification Links
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold tracking-tight text-fg-primary">
            Provide contact details for secure link dispatch
          </h2>
          <p className="text-[14px] text-fg-tertiary">
            Each Designated Partner will receive an automated document collection and biometric verification link via WhatsApp & SMS.
          </p>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          {partners.map((partner) => (
            <label key={partner} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-card p-4 shadow-xs">
              <div className="flex items-center gap-2 text-fg-secondary">
                <User className="w-4 h-4 text-brand" strokeWidth={2.5} />
                <span className="text-[14px] font-bold text-fg-primary">{partner}'s Mobile Number <span className="text-neg">*</span></span>
              </div>
              
              <div className="flex items-center gap-2.5 h-14 px-3.5 rounded-xl border border-line bg-surface-card mt-1 focus-within:border-brand transition-colors">
                <span className="w-6 h-4 rounded-sm overflow-hidden flex flex-col shrink-0">
                  <span className="flex-1 bg-[#FF9933]" />
                  <span className="flex-1 bg-white" />
                  <span className="flex-1 bg-[#138808]" />
                </span>
                <span className="text-[15px] font-semibold text-fg-primary">+91</span>
                <input 
                  type="tel"
                  value={phones[partner] ?? ""}
                  onChange={(e) => handlePhoneChange(partner, e.target.value)}
                  placeholder="Enter 10-digit number" 
                  className="flex-1 bg-transparent text-[15px] text-fg-primary outline-none tracking-wider"
                />
              </div>
            </label>
          ))}
        </div>
      </div>
    </Screen>
  );
}
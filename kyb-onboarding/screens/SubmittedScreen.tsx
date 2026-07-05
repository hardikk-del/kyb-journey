import { useNavigate } from "react-router-dom";
import { Check, Home } from "lucide-react";
import { Screen } from "../components/Screen";
import { BottomBar } from "../components/BottomBar";
import { Button } from "../components/Button";

export function SubmittedScreen() {
  const navigate = useNavigate();

  return (
    <Screen
      footer={
        <BottomBar>
          <Button full variant="dark" onClick={() => navigate("/")} leftIcon={<Home className="w-[18px] h-[18px]" strokeWidth={2} />}>
            Back to home
          </Button>
        </BottomBar>
      }
    >
      <div className="px-5 min-h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-pos-bg flex items-center justify-center anim-fade">
          <div className="w-14 h-14 rounded-full bg-pos-fg flex items-center justify-center">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
        </div>

        <h1 className="text-[24px] font-bold tracking-tight text-fg-primary mt-6">Application submitted</h1>
        <p className="text-[14px] text-fg-secondary mt-2 leading-relaxed max-w-[300px]">
          The current account application for <span className="font-semibold text-fg-primary">Kirana Traders</span> has been submitted successfully.
        </p>
      </div>
    </Screen>
  );
}

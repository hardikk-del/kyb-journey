import type { ReactNode } from "react";

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface-card border-t border-line-subtle px-5 pt-3.5 pb-7">
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

export function Screen({
  header,
  footer,
  children,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {header ? <div className="shrink-0 z-10">{header}</div> : null}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      {footer ? <div className="shrink-0 z-10">{footer}</div> : null}
    </div>
  );
}

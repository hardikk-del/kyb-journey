import type { ReactNode } from "react";

type Variant = "dark" | "light" | "brand";

export function Button({
  children,
  full,
  variant = "dark",
  disabled,
  onClick,
  leftIcon,
  rightIcon,
}: {
  children: ReactNode;
  full?: boolean;
  variant?: Variant;
  disabled?: boolean;
  onClick?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}) {
  const variantClass: Record<Variant, string> = {
    dark: "bg-fg-primary text-surface-card hover:bg-black",
    light: "bg-surface-card border border-line text-fg-primary hover:bg-surface-hover",
    brand: "bg-brand text-white hover:brightness-110",
  };
  const cls = [
    "inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl text-[15px] font-semibold transition-colors",
    full ? "w-full" : "",
    disabled ? "bg-line-strong text-surface-card cursor-not-allowed" : variantClass[variant],
  ].join(" ");

  return (
    <button type="button" className={cls} disabled={disabled} onClick={onClick}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

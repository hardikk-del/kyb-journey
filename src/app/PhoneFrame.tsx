import { cn } from '@/lib/cn'

export interface PhoneFrameProps {
  children: React.ReactNode
  className?: string
}

/**
 * A clean device bezel for the onboarding surface on desktop. ~390×844 canvas,
 * a subtle drop shadow on --paper, a notch, and a home indicator. On a real
 * phone viewport the frame collapses to full-bleed (the children fill the
 * screen); the bezel only shows on wider screens.
 */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center bg-paper p-0 sm:p-8', className)}>
      <div
        className={cn(
          // Full-bleed on phone; framed bezel from sm up.
          'relative w-full max-w-none bg-surface sm:max-w-phone sm:rounded-[2.25rem] sm:border-[10px] sm:border-ink sm:shadow-sheet',
        )}
      >
        {/* notch — only when framed */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-30 hidden h-6 w-36 -translate-x-1/2 rounded-b-xl bg-ink sm:block" />
        <div className="relative flex h-screen flex-col overflow-hidden bg-surface sm:h-phone sm:rounded-[1.6rem]">
          {children}
          {/* home indicator — only when framed */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 hidden h-1 w-32 -translate-x-1/2 rounded-full bg-ink/30 sm:block" />
        </div>
      </div>
    </div>
  )
}

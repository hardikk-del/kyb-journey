import { cn } from '@/lib/cn'
import { toneClasses, type Tone } from '@/lib/status'

export interface StatusPillProps {
  tone: Tone
  children: React.ReactNode
  /** Hide the leading dot (e.g. when used as a plain tag). */
  noDot?: boolean
  className?: string
}

/** Dot + label chip. Tone comes from lib/status — never an inline color. */
export function StatusPill({ tone, children, noDot, className }: StatusPillProps) {
  const t = toneClasses(tone)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap',
        t.pill,
        className,
      )}
    >
      {!noDot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} aria-hidden />}
      {children}
    </span>
  )
}

import { cn } from '@/lib/cn'
import { type Tone, toneClasses } from '@/lib/status'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  /** Small sub-line under the value (e.g. "vs 3–10 days today"). */
  hint?: React.ReactNode
  /** Optional tone accent on the value (status only). */
  tone?: Tone
  className?: string
}

/** Console KPI card. No gradient, no big icon (see 04). */
export function StatCard({ label, value, hint, tone, className }: StatCardProps) {
  return (
    <div className={cn('rounded-md border border-line bg-surface p-4', className)}>
      <div className="text-c-table uppercase tracking-wide text-ink-3">{label}</div>
      <div
        className={cn(
          'mt-2 font-mono text-[26px] leading-8 tnum',
          tone ? toneClasses(tone).text : 'text-ink',
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-caption text-ink-3">{hint}</div>}
    </div>
  )
}

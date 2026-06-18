import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ProgressBarProps {
  /** Current stage (1-based). */
  current: number
  total: number
  className?: string
}

/** Slim top progress bar for the phone app bar (3px, see 04). */
export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0
  return (
    <div
      className={cn('h-[3px] w-full bg-sunken', className)}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className="h-full bg-brand-600 transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export interface StepperProps {
  steps: string[]
  /** Active step index (0-based). */
  current: number
  className?: string
  onStepClick?: (index: number) => void
}

/** Entity-aware horizontal stepper (used on the phone where a labelled
 *  stepper is wanted, and in compact form on the console case header). */
export function Stepper({ steps, current, className, onStepClick }: StepperProps) {
  return (
    <ol className={cn('flex items-center gap-1.5 overflow-x-auto', className)}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const Tag = onStepClick ? 'button' : 'div'
        return (
          <li key={label} className="flex shrink-0 items-center gap-1.5">
            <Tag
              {...(onStepClick ? { onClick: () => onStepClick(i), type: 'button' as const } : {})}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-1 text-caption font-medium',
                active && 'bg-brand-50 text-brand-700',
                done && 'text-ink-2',
                !active && !done && 'text-ink-3',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold tnum',
                  active && 'bg-brand-600 text-white',
                  done && 'bg-ok text-white',
                  !active && !done && 'bg-sunken text-ink-3',
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : i + 1}
              </span>
              {label}
            </Tag>
            {i < steps.length - 1 && <span className="h-px w-3 bg-line" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

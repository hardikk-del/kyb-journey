import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  /** One line — what's empty and why. */
  title: string
  /** One action. No illustration, no emoji (see 04). */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-c-body text-ink-2">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

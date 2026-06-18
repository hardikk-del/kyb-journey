import { cn } from '@/lib/cn'

export interface SectionCardProps {
  title?: React.ReactNode
  /** Right-aligned slot in the header (e.g. an Edit button or a StatusPill). */
  action?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

/** A bordered card — borders carry the structure, no shadow (see 04). */
export function SectionCard({
  title,
  action,
  description,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section className={cn('rounded-md border border-line bg-surface', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            {title && <h2 className="text-section text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-caption text-ink-3">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

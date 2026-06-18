import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ProgressBar } from '@/components'

export interface PhoneShellProps {
  title: string
  /** Back affordance; omit to hide the chevron. */
  onBack?: () => void
  /** Progress: stage x of n under the app bar. Omit to hide. */
  progress?: { current: number; total: number }
  /** A persistent case chip (entity + tier) shown under the app bar. */
  caseChip?: React.ReactNode
  /** Bottom action bar content (primary + secondary). Omit for screens with
   *  no pinned action. */
  actions?: React.ReactNode
  children: React.ReactNode
}

/**
 * The phone app frame: 52px top app bar with back + centered title + "Demo
 * data" tag, a 3px progress bar, one scrollable body column, and a sticky
 * 64px bottom action bar. No desktop sidebar — this is a native-app surface.
 */
export function PhoneShell({ title, onBack, progress, caseChip, actions, children }: PhoneShellProps) {
  return (
    <div className="flex h-full flex-col bg-paper">
      {/* app bar */}
      <header className="z-20 shrink-0 bg-surface">
        <div className="flex h-appbar items-center px-2 sm:pt-3">
          <div className="flex w-14 items-center">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back"
                className="flex h-touch w-touch items-center justify-center rounded-md text-ink-2 hover:bg-sunken"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
            )}
          </div>
          <h1 className="flex-1 truncate text-center text-section text-ink">{title}</h1>
          <div className="flex w-14 justify-end pr-2">
            <span className="rounded-full bg-sunken px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
              Demo
            </span>
          </div>
        </div>
        {progress && <ProgressBar current={progress.current} total={progress.total} />}
        {caseChip && <div className="border-t border-line px-4 py-2">{caseChip}</div>}
      </header>

      {/* body */}
      <main className={cn('min-h-0 flex-1 overflow-y-auto px-4 py-4', 'space-y-4')}>{children}</main>

      {/* bottom action bar */}
      {actions && (
        <div className="z-20 shrink-0 border-t border-line bg-surface px-4 pb-3 pt-3 sm:pb-5">
          <div className="flex items-center gap-3">{actions}</div>
        </div>
      )}
    </div>
  )
}

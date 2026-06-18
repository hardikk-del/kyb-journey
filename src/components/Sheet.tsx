import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  /** Pinned footer (e.g. confirm/cancel). */
  footer?: React.ReactNode
  /** 'bottom' = phone bottom sheet (default); 'center' = desktop modal. */
  variant?: 'bottom' | 'center'
  className?: string
}

/** Radix Dialog styled as a bottom sheet (phone) or centered modal (console).
 *  Bottom sheets slide up; modals use a faint shadow only. */
export function Sheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  variant = 'bottom',
  className,
}: SheetProps) {
  const bottom = variant === 'bottom'
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-ink/30',
            'data-[state=open]:animate-[fade_160ms_ease] data-[state=closed]:animate-[fade_120ms_ease_reverse]',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed z-50 bg-surface shadow-sheet outline-none',
            bottom
              ? 'inset-x-0 bottom-0 mx-auto max-w-phone rounded-t-xl data-[state=open]:animate-[sheetUp_220ms_cubic-bezier(.32,.72,0,1)]'
              : 'left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-xl data-[state=open]:animate-[fade_160ms_ease]',
            className,
          )}
        >
          {bottom && (
            <div className="flex justify-center pt-2">
              <span className="h-1 w-9 rounded-full bg-line-strong" aria-hidden />
            </div>
          )}
          {(title || description) && (
            <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3">
              <div>
                {title && <Dialog.Title className="text-section text-ink">{title}</Dialog.Title>}
                {description && (
                  <Dialog.Description className="mt-0.5 text-caption text-ink-3">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className="rounded-md p-1 text-ink-3 hover:bg-sunken hover:text-ink-2"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </Dialog.Close>
            </div>
          )}
          <div className="max-h-[70vh] overflow-y-auto px-4 py-2">{children}</div>
          {footer && <div className="border-t border-line px-4 py-3">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

import { create } from 'zustand'
import { useEffect } from 'react'
import { Check, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { type Tone, toneClasses } from '@/lib/status'

export interface ToastItem {
  id: number
  message: string
  tone: Tone
}

interface ToastStore {
  toasts: ToastItem[]
  push: (message: string, tone?: Tone) => void
  dismiss: (id: number) => void
}

let seq = 1
export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, tone = 'ok') =>
    set((s) => ({ toasts: [...s.toasts, { id: seq++, message, tone }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Imperative helper so non-component code can toast. */
export const toast = (message: string, tone: Tone = 'ok') => useToast.getState().push(message, tone)

const ICON: Record<Tone, typeof Check> = {
  ok: Check,
  warn: AlertTriangle,
  risk: AlertTriangle,
  info: Info,
  neutral: Info,
}

function ToastRow({ item }: { item: ToastItem }) {
  const dismiss = useToast((s) => s.dismiss)
  const Icon = ICON[item.tone]
  const t = toneClasses(item.tone)
  useEffect(() => {
    const id = setTimeout(() => dismiss(item.id), 3200)
    return () => clearTimeout(id)
  }, [item.id, dismiss])
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-line bg-surface px-3 py-2.5 shadow-popover animate-[fade_160ms_ease]">
      <span className={cn('mt-0.5 flex h-4 w-4 items-center justify-center rounded-full', t.solid)}>
        <Icon className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
      </span>
      <span className="flex-1 text-c-body text-ink">{item.message}</span>
      <button
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss"
        className="text-ink-3 hover:text-ink-2"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

/** Mount once at the app root. */
export function ToastViewport() {
  const toasts = useToast((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] mx-auto flex max-w-[360px] flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastRow item={t} />
        </div>
      ))}
    </div>
  )
}

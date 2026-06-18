/** Shared capture-surface components for the phone onboarding flow. */
import { useState } from 'react'
import {
  Camera,
  Check,
  FileText,
  ImageUp,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { StatusPill } from '@/components'
import type { Tone } from '@/lib/status'
import type { Tier, Document, DocFieldMatch } from '@/data/types'

/* ---------------- tier chip ---------------- */

export function TierChip({ tier }: { tier: Tier }) {
  const simplified = tier === 'simplified'
  return (
    <StatusPill tone={simplified ? 'ok' : 'info'} noDot>
      <ShieldCheck className="h-3 w-3" strokeWidth={1.75} />
      {simplified ? 'Simplified DD (≤ ₹40L)' : 'Full CDD'}
    </StatusPill>
  )
}

/* ---------------- source tag (prefill provenance) ---------------- */

export function SourceTag({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600">
      from {source}
    </span>
  )
}

/* ---------------- read-only prefilled field row ---------------- */

export function DataRow({
  label,
  value,
  source,
  mono,
}: {
  label: string
  value?: React.ReactNode
  source?: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <span className="text-label text-ink-3">{label}</span>
      <span className="flex flex-wrap items-center justify-end gap-1.5 text-right">
        <span className={cn('text-c-body text-ink', mono && 'font-mono tnum')}>{value ?? '—'}</span>
        {source && <SourceTag source={source} />}
      </span>
    </div>
  )
}

/* ---------------- camera capture mock ---------------- */

export function CameraCapture({
  label,
  hint,
  captured,
  onCapture,
  shape = 'rect',
}: {
  label: string
  hint?: string
  captured?: boolean
  onCapture: () => void
  shape?: 'rect' | 'circle'
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-ink',
          shape === 'circle' ? 'h-52 w-52 rounded-full' : 'aspect-[4/3] w-full rounded-md',
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute border-2 border-dashed border-white/30',
            shape === 'circle' ? 'inset-4 rounded-full' : 'inset-3 rounded-md',
          )}
        />
        {captured ? (
          <div className="flex flex-col items-center text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ok">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <span className="mt-2 text-c-body">Captured</span>
          </div>
        ) : (
          <Camera className="h-10 w-10 text-white/40" strokeWidth={1.5} />
        )}
      </div>
      {hint && <p className="mt-2 text-caption text-ink-3">{hint}</p>}
      <button
        onClick={onCapture}
        className={cn(
          'mt-3 flex h-touch items-center justify-center gap-2 rounded-full px-5 text-c-body font-medium',
          captured ? 'bg-sunken text-ink-2' : 'bg-brand-600 text-white',
        )}
      >
        <Camera className="h-4 w-4" strokeWidth={1.75} />
        {captured ? `Retake ${label.toLowerCase()}` : `Capture ${label.toLowerCase()}`}
      </button>
    </div>
  )
}

/* ---------------- document upload row with OCR cross-check ---------------- */

const MATCH_TONE: Record<DocFieldMatch['match'], Tone> = {
  match: 'ok',
  partial: 'warn',
  mismatch: 'risk',
}
const MATCH_LABEL: Record<DocFieldMatch['match'], string> = {
  match: 'Match',
  partial: 'Partial',
  mismatch: 'Mismatch',
}

export function DocumentRow({ doc, onOpen }: { doc: Document; onOpen?: () => void }) {
  const hasMismatch = doc.fields?.some((f) => f.match === 'mismatch')
  const statusTone: Tone =
    doc.status === 'received' ? (hasMismatch ? 'warn' : 'ok') : doc.status === 'requested' ? 'info' : 'neutral'
  const statusLabel =
    doc.status === 'received' ? (hasMismatch ? 'Check field' : 'Read') : doc.status === 'requested' ? 'Sent' : 'Pending'
  const Wrapper = onOpen ? 'button' : 'div'
  return (
    <Wrapper
      {...(onOpen ? { onClick: onOpen, type: 'button' as const } : {})}
      className="flex w-full items-center gap-3 px-4 py-3 text-left"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-3">
        <FileText className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-c-body font-medium text-ink">{doc.label}</span>
        {doc.fields && doc.fields.length > 0 && (
          <span className="mt-0.5 block truncate text-caption text-ink-3">
            {doc.fields[0].label}: {doc.fields[0].extracted}
          </span>
        )}
      </span>
      <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      {onOpen && <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.75} />}
    </Wrapper>
  )
}

export function FieldMatch({ field }: { field: DocFieldMatch }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-label text-ink-3">{field.label}</div>
        <div className="font-mono text-c-mono tnum text-ink">{field.extracted}</div>
      </div>
      <StatusPill tone={MATCH_TONE[field.match]}>{MATCH_LABEL[field.match]}</StatusPill>
    </div>
  )
}

/* ---------------- name-mismatch side-by-side comparison ---------------- */

export function NameMismatch({ a, b, labelA, labelB }: { a: string; b: string; labelA: string; labelB: string }) {
  return (
    <div className="rounded-md border border-warn/30 bg-warn-bg p-3">
      <div className="mb-2 flex items-center gap-1.5 text-label text-warn">
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
        Name mismatch
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-sm bg-surface px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-3">{labelA}</div>
          <div className="text-c-body text-ink">{a}</div>
        </div>
        <div className="rounded-sm bg-surface px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-3">{labelB}</div>
          <div className="text-c-body text-ink">{b}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- file picker control (upload affordance) ---------------- */

export function UploadButton({ label, onUpload }: { label: string; onUpload: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      onClick={() => {
        setBusy(true)
        setTimeout(() => {
          setBusy(false)
          onUpload()
        }, 700)
      }}
      className="flex h-touch w-full items-center justify-center gap-2 rounded-md border border-line-strong bg-surface text-c-body font-medium text-ink-2 hover:bg-sunken"
    >
      <ImageUp className={cn('h-4 w-4', busy && 'animate-pulse')} strokeWidth={1.75} />
      {busy ? 'Uploading…' : label}
    </button>
  )
}

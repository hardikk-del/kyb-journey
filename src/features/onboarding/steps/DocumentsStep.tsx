import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Send, Camera, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, SectionCard, Segmented, StatusPill, Sheet } from '@/components'
import type { Document } from '@/data/types'
import { CaptureScreen } from '../flow'
import { useOnboarding } from '../store'
import { ENTITY_PROFILE } from '../draft'
import { DocumentRow, FieldMatch, UploadButton } from '../components'

type Mode = 'link' | 'capture'
type LinkState = 'idle' | 'sending' | 'sent'

const QUALITY_LABEL: Record<string, string> = {
  original: 'Original',
  not_tampered: 'Not tampered',
  legible: 'Legible',
}

export function DocumentsStep() {
  const draft = useOnboarding((s) => s.current())
  const update = useOnboarding((s) => s.update)
  const [mode, setMode] = useState<Mode>('link')
  const [linkState, setLinkState] = useState<LinkState>(draft?.documents.some((d) => d.status === 'received') ? 'sent' : 'idle')
  const [openDoc, setOpenDoc] = useState<Document | null>(null)

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  const profile = ENTITY_PROFILE[draft.entityType]
  // Build the checklist: prefilled docs if present, else the entity doc set.
  const docs: Document[] =
    draft.documents.length > 0
      ? draft.documents
      : profile.docs.map((label, i) => ({ id: `doc_${i}`, label, status: 'pending' as const }))

  const received = docs.filter((d) => d.status === 'received').length
  const total = docs.length
  const allReceived = received === total

  function sendLink() {
    setLinkState('sending')
    setTimeout(() => setLinkState('sent'), 1400)
  }

  function captureDoc(id: string) {
    update({
      documents: docs.map((d) =>
        d.id === id
          ? { ...d, status: 'received', quality: ['original', 'legible'], fields: d.fields }
          : d,
      ),
    })
  }

  return (
    <CaptureScreen step="documents" title="Documents" primaryDisabled={received === 0}>
      <p className="text-c-body text-ink-2">
        Send a secure upload link, or capture on the customer's behalf. Each upload is auto-read and
        cross-checked.
      </p>

      <Segmented
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        options={[
          { value: 'link', label: 'Send secure link' },
          { value: 'capture', label: 'Capture on behalf' },
        ]}
        ariaLabel="Collection mode"
      />

      {mode === 'link' && (
        <SectionCard title="Secure upload link">
          {linkState !== 'sent' ? (
            <div className="space-y-3">
              <Segmented
                value={draft.docChannel}
                onValueChange={(v) => update({ docChannel: v as 'SMS' | 'WhatsApp' })}
                options={[
                  { value: 'WhatsApp', label: 'WhatsApp' },
                  { value: 'SMS', label: 'SMS' },
                ]}
                ariaLabel="Link channel"
              />
              <Button block variant="secondary" onClick={sendLink} loading={linkState === 'sending'}>
                <Send className="h-4 w-4" strokeWidth={1.75} />
                {linkState === 'sending' ? 'Sending…' : `Send link via ${draft.docChannel}`}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-ok-bg px-3 py-2 text-c-body text-ok">
              <Check className="h-4 w-4" strokeWidth={2} />
              Link sent via {draft.docChannel}. Uploads arrive below.
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard
        title="Document tracker"
        action={
          <StatusPill tone={allReceived ? 'ok' : 'info'}>
            {received} / {total} received
          </StatusPill>
        }
        bodyClassName="p-0"
      >
        <div className="divide-y divide-line">
          {docs.map((d) =>
            d.status === 'received' ? (
              <DocumentRow key={d.id} doc={d} onOpen={() => setOpenDoc(d)} />
            ) : (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-3">
                  <Clock className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1 truncate text-c-body text-ink-2">{d.label}</span>
                {mode === 'capture' ? (
                  <button
                    onClick={() => captureDoc(d.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2.5 py-1.5 text-caption font-medium text-ink-2 hover:bg-sunken"
                  >
                    <Camera className="h-3.5 w-3.5" strokeWidth={1.75} /> Capture
                  </button>
                ) : (
                  <StatusPill tone="neutral">Waiting</StatusPill>
                )}
              </div>
            ),
          )}
        </div>
      </SectionCard>

      {mode === 'capture' && !allReceived && (
        <UploadButton
          label="Upload a document file"
          onUpload={() => {
            const firstPending = docs.find((d) => d.status !== 'received')
            if (firstPending) captureDoc(firstPending.id)
          }}
        />
      )}

      {/* document detail sheet — OCR fields + quality + match/mismatch */}
      <Sheet open={!!openDoc} onOpenChange={(o) => !o && setOpenDoc(null)} title={openDoc?.label} description="Auto-read fields, cross-checked">
        {openDoc && (
          <div className="space-y-3 pb-2">
            {openDoc.quality && openDoc.quality.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {openDoc.quality.map((q) => (
                  <StatusPill key={q} tone="ok">
                    {QUALITY_LABEL[q] ?? q}
                  </StatusPill>
                ))}
              </div>
            )}
            {openDoc.fields && openDoc.fields.length > 0 ? (
              <div
                className={cn(
                  'divide-y divide-line rounded-md border px-3',
                  openDoc.fields.some((f) => f.match === 'mismatch') ? 'border-warn/30' : 'border-line',
                )}
              >
                {openDoc.fields.map((f) => (
                  <FieldMatch key={f.label} field={f} />
                ))}
              </div>
            ) : (
              <p className="text-c-body text-ink-3">Extracted fields appear here once read.</p>
            )}
            {openDoc.fields?.some((f) => f.match === 'mismatch') && (
              <p className="rounded-md bg-warn-bg px-3 py-2 text-caption text-warn">
                A field didn't match captured data — the officer will adjudicate during review.
              </p>
            )}
          </div>
        )}
      </Sheet>
    </CaptureScreen>
  )
}

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Pencil, Info } from 'lucide-react'
import { Input, SectionCard, IdChip, StatusPill } from '@/components'
import type { IdKind } from '@/components'
import { ENTITY_LABEL } from '@/data/types'
import { formatINRCompact } from '@/lib/format'
import { defaultConfig } from '@/data/config'
import { CaptureScreen } from '../flow'
import { useOnboarding } from '../store'
import { DataRow } from '../components'

const ID_FIELD_META: Record<string, { kind: IdKind; label: string }> = {
  entityPan: { kind: 'PAN', label: 'PAN' },
  gstin: { kind: 'GSTIN', label: 'GSTIN' },
  cin: { kind: 'CIN', label: 'CIN' },
  llpin: { kind: 'LLPIN', label: 'LLPIN' },
  udyam: { kind: 'Udyam', label: 'Udyam' },
}

export function BusinessStep() {
  const draft = useOnboarding((s) => s.current())
  const setTurnover = useOnboarding((s) => s.setTurnover)
  const [editing, setEditing] = useState(false)
  const [turnoverText, setTurnoverText] = useState('')

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  const profile = draft.entityType
  const idFields = (['entityPan', 'gstin', 'cin', 'llpin', 'udyam'] as const).filter((f) => draft[f])

  const tierLine = draft.declaredTurnover
    ? draft.declaredTurnover < defaultConfig.tierTurnoverThreshold
      ? 'Below ₹40L → simplified due diligence.'
      : 'At/above ₹40L → full customer due diligence.'
    : undefined

  function commitTurnover() {
    const digits = Number(turnoverText.replace(/[^0-9]/g, ''))
    if (digits > 0) setTurnover(digits)
    setEditing(false)
    setTurnoverText('')
  }

  return (
    <CaptureScreen step="business" title="Business details">
      <p className="text-c-body text-ink-2">
        Prefilled from the anchor lookup. Confirm or edit before continuing.
      </p>

      <SectionCard
        title={ENTITY_LABEL[profile]}
        action={
          <button
            onClick={() => setEditing((e) => !e)}
            className="inline-flex items-center gap-1 text-caption font-medium text-brand-600"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            {editing ? 'Done' : 'Edit'}
          </button>
        }
        bodyClassName="p-0"
      >
        <div className="divide-y divide-line px-4">
          <DataRow label="Legal name" value={draft.legalName} source={draft.prefilledFrom?.legalName} />
          {draft.tradeName !== undefined && (
            <DataRow label="Trade name" value={draft.tradeName} />
          )}
          {idFields.map((f) => {
            const meta = ID_FIELD_META[f]
            return (
              <div key={f} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-label text-ink-3">{meta.label}</span>
                <span className="flex items-center gap-1.5">
                  <IdChip kind={meta.kind} value={draft[f] as string} showLabel={false} />
                </span>
              </div>
            )
          })}
          <DataRow
            label="Registered address"
            value={draft.registeredAddress}
            source={draft.prefilledFrom?.registeredAddress}
          />
          <DataRow label="State" value={draft.state} />
        </div>
      </SectionCard>

      <SectionCard title="Turnover & tier">
        {editing ? (
          <div className="space-y-2">
            <Input
              label="Declared annual turnover (₹)"
              mono
              inputMode="numeric"
              placeholder={String(draft.declaredTurnover ?? '')}
              value={turnoverText}
              onChange={(e) => setTurnoverText(e.target.value)}
              onBlur={commitTurnover}
              hint="Crossing ₹40L re-classifies the due-diligence tier."
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-section tnum text-ink">
                {draft.declaredTurnover ? formatINRCompact(draft.declaredTurnover) : '—'}
              </div>
              <div className="mt-0.5 text-caption text-ink-3">Declared annual turnover</div>
            </div>
            {draft.tier && (
              <StatusPill tone={draft.tier === 'simplified' ? 'ok' : 'info'} noDot>
                {draft.tier === 'simplified' ? 'Simplified DD' : 'Full CDD'}
              </StatusPill>
            )}
          </div>
        )}
        {tierLine && (
          <div className="mt-3 flex items-start gap-1.5 rounded-md bg-sunken px-3 py-2 text-caption text-ink-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.75} />
            {tierLine}
          </div>
        )}
      </SectionCard>
    </CaptureScreen>
  )
}

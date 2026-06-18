import { Navigate, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { SectionCard, StatusPill, IdChip } from '@/components'
import { checkStatusMeta } from '@/lib/status'
import {
  ENTITY_LABEL,
  IDENTITY_PATH_LABEL,
} from '@/data/types'
import { formatINRCompact, maskAccount } from '@/lib/format'
import { CaptureScreen, useFlowNav } from '../flow'
import { useOnboarding } from '../store'
import type { StepId } from '../draft'

function EditLink({ to }: { to: StepId }) {
  const { goStep } = useFlowNav()
  return (
    <button onClick={() => goStep(to)} className="inline-flex items-center gap-1 text-caption font-medium text-brand-600">
      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Edit
    </button>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-label text-ink-3">{label}</span>
      <span className="text-right text-c-body text-ink">{value}</span>
    </div>
  )
}

export function ReviewStep() {
  const draft = useOnboarding((s) => s.current())
  const submit = useOnboarding((s) => s.submit)
  const navigate = useNavigate()

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  function onSubmit() {
    submit()
    // Hand off to the Verify screen (built in Phase 4).
    navigate('/onboarding/verify')
  }

  const penny = draft.pennyDrop

  return (
    <CaptureScreen step="review" title="Review & submit" primaryLabel="Submit for verification" onPrimary={onSubmit}>
      <p className="text-c-body text-ink-2">
        Confirm the captured profile. Submitting runs all checks in parallel into one risk score.
      </p>

      <SectionCard title="Business" action={<EditLink to="business" />} bodyClassName="p-0">
        <div className="divide-y divide-line px-4">
          <Row label="Legal name" value={draft.legalName} />
          {draft.tradeName && <Row label="Trade name" value={draft.tradeName} />}
          <Row label="Entity" value={ENTITY_LABEL[draft.entityType]} />
          {draft.gstin && <Row label="GSTIN" value={<IdChip kind="GSTIN" value={draft.gstin} showLabel={false} />} />}
          {draft.cin && <Row label="CIN" value={<IdChip kind="CIN" value={draft.cin} showLabel={false} />} />}
          {draft.llpin && <Row label="LLPIN" value={<IdChip kind="LLPIN" value={draft.llpin} showLabel={false} />} />}
          <Row
            label="Turnover · tier"
            value={
              <span className="flex items-center justify-end gap-2">
                <span className="font-mono tnum">{draft.declaredTurnover ? formatINRCompact(draft.declaredTurnover) : '—'}</span>
                {draft.tier && (
                  <StatusPill tone={draft.tier === 'simplified' ? 'ok' : 'info'} noDot>
                    {draft.tier === 'simplified' ? 'Simplified' : 'Full CDD'}
                  </StatusPill>
                )}
              </span>
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="People & KYC" action={<EditLink to="identity" />} bodyClassName="p-0">
        <div className="divide-y divide-line px-4">
          {draft.people.map((p) => {
            const path = draft.identityPaths[p.id] ?? p.identityPath
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-c-body text-ink">{p.name}</div>
                  <div className="text-caption text-ink-3">{path ? IDENTITY_PATH_LABEL[path] : 'Path not set'}</div>
                </div>
                <StatusPill tone={checkStatusMeta(p.kyc ?? 'pending').tone}>
                  {checkStatusMeta(p.kyc ?? 'pending').label}
                </StatusPill>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Account" action={<EditLink to="financials" />} bodyClassName="p-0">
        <div className="divide-y divide-line px-4">
          <Row label="Settlement account" value={<span className="font-mono tnum">{draft.account ? maskAccount(draft.account.number) : '—'}</span>} />
          {draft.account && <Row label="IFSC" value={<IdChip kind="IFSC" value={draft.account.ifsc} showLabel={false} />} />}
          <Row
            label="Penny-drop"
            value={
              <StatusPill tone={penny.status === 'match' ? 'ok' : penny.status === 'mismatch' ? 'warn' : 'neutral'}>
                {penny.status === 'match' ? 'Name match' : penny.status === 'mismatch' ? 'Name mismatch' : 'Not run'}
              </StatusPill>
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Premises & FATCA" action={<EditLink to="premises" />} bodyClassName="p-0">
        <div className="divide-y divide-line px-4">
          <Row
            label="Premises photos"
            value={
              <StatusPill tone={draft.premises.shopFront && draft.premises.nameBoard ? 'ok' : 'neutral'}>
                {draft.premises.shopFront && draft.premises.nameBoard ? 'Captured' : 'Incomplete'}
              </StatusPill>
            }
          />
          <Row label="Foreign tax resident" value={draft.fatca.foreignTaxResident ? 'Yes' : 'No'} />
        </div>
      </SectionCard>
    </CaptureScreen>
  )
}

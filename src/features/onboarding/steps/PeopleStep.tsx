import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UserPlus, ShieldCheck, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, SectionCard, StatusPill, IdChip, Sheet, Input } from '@/components'
import { formatPct } from '@/lib/format'
import { defaultConfig } from '@/data/config'
import {
  ENTITY_LABEL,
  type BeneficialOwner,
  type Person,
  type PersonRole,
} from '@/data/types'
import { CaptureScreen } from '../flow'
import { useOnboarding } from '../store'
import { ENTITY_PROFILE } from '../draft'

const ROLE_LABEL: Record<PersonRole, string> = {
  proprietor: 'Proprietor',
  partner: 'Partner',
  designated_partner: 'Designated partner',
  director: 'Director',
  shareholder: 'Shareholder',
  signatory: 'Signatory',
}

function deriveBOs(people: Person[], threshold: number, existing: BeneficialOwner[]): BeneficialOwner[] {
  if (existing.length > 0) return existing.filter((b) => b.effectiveOwnership > threshold)
  return people
    .filter((p) => (p.ownership ?? 0) > threshold)
    .map((p) => ({ personId: p.id, effectiveOwnership: p.ownership ?? 0 }))
}

/** Compact ownership preview — entity at top, owners beneath with their share.
 *  The full network graph is the console signature element (Phase 6). */
function MiniGraph({ entityLabel, people }: { entityLabel: string; people: Person[] }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="rounded-md border border-brand-600/30 bg-brand-50 px-3 py-1.5 text-c-body font-medium text-brand-700">
        {entityLabel}
      </div>
      <div className="h-4 w-px bg-line-strong" />
      <div className="flex w-full flex-wrap items-start justify-center gap-2">
        {people.map((p) => (
          <div key={p.id} className="flex flex-col items-center">
            <div
              className={cn(
                'max-w-[120px] truncate rounded-md border px-2.5 py-1.5 text-center text-caption',
                p.kyc === 'flag' || p.kyc === 'fail'
                  ? 'border-risk/40 bg-risk-bg text-risk'
                  : 'border-line bg-surface text-ink',
              )}
            >
              <div className="truncate font-medium">{p.name}</div>
              {p.ownership !== undefined && (
                <div className="font-mono tnum text-ink-3">{formatPct(p.ownership, { fraction: true })}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PeopleStep() {
  const draft = useOnboarding((s) => s.current())
  const update = useOnboarding((s) => s.update)
  const [openPerson, setOpenPerson] = useState<Person | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', pan: '', ownership: '' })

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  const profile = ENTITY_PROFILE[draft.entityType]
  const bos = deriveBOs(draft.people, defaultConfig.beneficialOwnerThreshold, draft.beneficialOwners)
  const boIds = new Set(bos.map((b) => b.personId))

  function addPerson() {
    if (!form.name) return
    const person: Person = {
      id: `p_new_${draft!.people.length + 1}`,
      name: form.name,
      roles: [draft!.entityType === 'proprietorship' ? 'proprietor' : 'partner'],
      pan: form.pan || undefined,
      ownership: form.ownership ? Number(form.ownership) / 100 : undefined,
      kyc: 'pending',
      nationality: 'IN',
    }
    update({ people: [...draft!.people, person] })
    setForm({ name: '', pan: '', ownership: '' })
    setAddOpen(false)
  }

  return (
    <CaptureScreen
      step="people"
      title="People & ownership"
      primaryDisabled={draft.people.length === 0}
    >
      <SectionCard
        title={profile.peopleRoleLabel}
        description={`${draft.people.length} captured`}
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1 text-caption font-medium text-brand-600"
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} /> Add
          </button>
        }
        bodyClassName="p-0"
      >
        {draft.people.length === 0 ? (
          <div className="px-4 py-6 text-center text-c-body text-ink-3">
            No one added yet. Add the {profile.peopleRoleLabel.toLowerCase()}.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {draft.people.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenPerson(p)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-caption font-medium text-ink-2">
                  {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-c-body font-medium text-ink">{p.name}</span>
                  <span className="text-caption text-ink-3">
                    {p.roles.map((r) => ROLE_LABEL[r]).join(' · ')}
                    {p.ownership !== undefined && ` · ${formatPct(p.ownership, { fraction: true })}`}
                  </span>
                </span>
                {boIds.has(p.id) && <StatusPill tone="info" noDot>BO</StatusPill>}
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.75} />
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Beneficial owners"
        description={`Derived against the >${formatPct(defaultConfig.beneficialOwnerThreshold, { fraction: true })} threshold`}
      >
        {bos.length === 0 ? (
          <p className="text-c-body text-ink-3">No individual crosses the threshold yet.</p>
        ) : (
          <div className="space-y-2">
            {bos.map((b) => {
              const person = draft.people.find((p) => p.id === b.personId)
              return (
                <div key={b.personId} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-c-body text-ink">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.75} />
                    {person?.name ?? b.personId}
                    {b.viaCorporate && <StatusPill tone="neutral" noDot>via corporate</StatusPill>}
                  </span>
                  <span className="font-mono tnum text-c-body text-ink">
                    {formatPct(b.effectiveOwnership, { fraction: true })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Ownership preview">
        <MiniGraph entityLabel={draft.tradeName || ENTITY_LABEL[draft.entityType]} people={draft.people} />
      </SectionCard>

      {/* person detail sheet */}
      <Sheet
        open={!!openPerson}
        onOpenChange={(o) => !o && setOpenPerson(null)}
        title={openPerson?.name}
        description={openPerson?.roles.map((r) => ROLE_LABEL[r]).join(' · ')}
      >
        {openPerson && (
          <div className="space-y-3 pb-2">
            {openPerson.pan && (
              <div className="flex items-center justify-between">
                <span className="text-label text-ink-3">PAN</span>
                <IdChip kind="PAN" value={openPerson.pan} showLabel={false} />
              </div>
            )}
            {openPerson.din && (
              <div className="flex items-center justify-between">
                <span className="text-label text-ink-3">DIN / DPIN</span>
                <IdChip kind="DIN" value={openPerson.din} showLabel={false} />
              </div>
            )}
            {openPerson.ownership !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-label text-ink-3">Ownership</span>
                <span className="font-mono tnum text-c-body text-ink">
                  {formatPct(openPerson.ownership, { fraction: true })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-label text-ink-3">Authorised signatory</span>
              <StatusPill tone={openPerson.isSignatory ? 'ok' : 'neutral'} noDot>
                {openPerson.isSignatory ? 'Yes' : 'No'}
              </StatusPill>
            </div>
            {openPerson.notes?.map((n) => (
              <p key={n} className="rounded-md bg-warn-bg px-3 py-2 text-caption text-warn">
                {n}
              </p>
            ))}
          </div>
        )}
      </Sheet>

      {/* add person sheet */}
      <Sheet
        open={addOpen}
        onOpenChange={setAddOpen}
        title={`Add ${profile.peopleRoleLabel.toLowerCase()}`}
        footer={
          <Button block onClick={addPerson} disabled={!form.name}>
            <Plus className="h-4 w-4" strokeWidth={1.75} /> Add person
          </Button>
        }
      >
        <div className="space-y-3 pb-2">
          <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="PAN" mono value={form.pan} onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value.toUpperCase() }))} />
          <Input
            label="Ownership %"
            mono
            inputMode="numeric"
            value={form.ownership}
            onChange={(e) => setForm((f) => ({ ...f, ownership: e.target.value }))}
          />
        </div>
      </Sheet>
    </CaptureScreen>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, FileClock, AlertTriangle } from 'lucide-react'
import { PhoneShell } from '@/app/PhoneShell'
import { Button, Input, Segmented, SectionCard, IdChip } from '@/components'
import { ENTITY_LABEL, type EntityType } from '@/data/types'
import { findByAnchor, getApplication } from '@/services/applications'
import { validatePAN, validateGSTIN } from '@/lib/validators'
import { formatINRCompact } from '@/lib/format'
import { useOnboarding } from '../store'
import { useFlowNav } from '../flow'
import { ENTITY_PROFILE, type AnchorKind } from '../draft'
import { TierChip } from '../components'

const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'pvt_ltd', label: 'Private Limited' },
]

const ANCHOR_OPTIONS: { value: AnchorKind; label: string }[] = [
  { value: 'pan', label: 'PAN' },
  { value: 'gstin', label: 'GSTIN' },
  { value: 'mobile', label: 'Mobile' },
]

const CHANNEL_OPTIONS = [
  { value: 'agent', label: 'Field agent' },
  { value: 'branch', label: 'Branch RM' },
  { value: 'self_serve', label: 'Self-serve' },
]

const ANCHOR_PLACEHOLDER: Record<AnchorKind, string> = {
  pan: 'ABCDE1234F',
  gstin: '29ABCDE1234F1Z5',
  mobile: '98XXXXXXXX',
}

type LookupState =
  | { kind: 'idle' }
  | { kind: 'searching' }
  | { kind: 'matched'; appId: string; name: string; tradeName?: string; turnover: number; tier: string }
  | { kind: 'duplicate'; appId: string; name: string; stage: string }
  | { kind: 'none' }
  | { kind: 'error' }

export function StartStep() {
  const navigate = useNavigate()
  const { goStep } = useFlowNav()
  const drafts = useOnboarding((s) => s.drafts)
  const startNew = useOnboarding((s) => s.startNew)
  const open = useOnboarding((s) => s.open)
  const update = useOnboarding((s) => s.update)
  const prefillFrom = useOnboarding((s) => s.prefillFrom)

  const [entityType, setEntityType] = useState<EntityType>('proprietorship')
  const [anchorKind, setAnchorKind] = useState<AnchorKind>('pan')
  const [anchor, setAnchor] = useState('')
  const [channel, setChannel] = useState('agent')
  const [lookup, setLookup] = useState<LookupState>({ kind: 'idle' })

  const resumable = Object.values(drafts).filter((d) => d.status === 'draft')

  const anchorError =
    anchor && anchorKind === 'pan'
      ? validatePAN(anchor).message
      : anchor && anchorKind === 'gstin'
        ? validateGSTIN(anchor).message
        : undefined

  function pickEntity(v: EntityType) {
    setEntityType(v)
    setAnchorKind(ENTITY_PROFILE[v].primaryAnchor)
    setLookup({ kind: 'idle' })
  }

  async function runLookup() {
    setLookup({ kind: 'searching' })
    try {
      const match = await findByAnchor(anchor)
      if (!match) {
        setLookup({ kind: 'none' })
        return
      }
      // An already-active/onboarded profile → offer to open it instead.
      if (['account_opened', 'deployed', 'active', 'monitoring'].includes(match.stage)) {
        setLookup({ kind: 'duplicate', appId: match.id, name: match.legalName, stage: match.stage })
        return
      }
      setLookup({
        kind: 'matched',
        appId: match.id,
        name: match.legalName,
        tradeName: match.tradeName,
        turnover: match.declaredTurnover,
        tier: match.tier,
      })
    } catch {
      setLookup({ kind: 'error' })
    }
  }

  async function beginWithMatch() {
    if (lookup.kind !== 'matched') return
    startNew(entityType)
    update({ anchorKind, anchor: anchor.toUpperCase(), channel: channel as never })
    // Hydrate from the matched fixture, then jump into Business details.
    const app = await getApplication(lookup.appId)
    prefillFrom(app)
    goStep('business')
  }

  function beginManual() {
    startNew(entityType)
    update({ anchorKind, anchor: anchor.toUpperCase(), channel: channel as never, entityType })
    goStep('business')
  }

  function resume(id: string) {
    open(id)
    const d = drafts[id]
    goStep(d.furthestStep === 'start' ? 'business' : d.furthestStep)
  }

  return (
    <PhoneShell
      title="New onboarding"
      onBack={() => navigate('/')}
      actions={
        lookup.kind === 'matched' ? (
          <Button block onClick={beginWithMatch}>
            Use these details
          </Button>
        ) : lookup.kind === 'none' ? (
          <Button block onClick={beginManual}>
            Continue, enter manually
          </Button>
        ) : (
          <Button block onClick={runLookup} loading={lookup.kind === 'searching'} disabled={!anchor || !!anchorError}>
            Look up &amp; prefill
          </Button>
        )
      }
    >
      {resumable.length > 0 && (
        <SectionCard title="Resume a draft">
          <div className="divide-y divide-line">
            {resumable.map((d) => (
              <button
                key={d.id}
                onClick={() => resume(d.id)}
                className="flex w-full items-center gap-3 py-2.5 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sunken text-ink-3">
                  <FileClock className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-c-body font-medium text-ink">
                    {d.tradeName || d.legalName || (d.entityType ? ENTITY_LABEL[d.entityType] : 'Untitled')}
                  </span>
                  <span className="text-caption text-ink-3">Resume at {d.furthestStep}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      <div>
        <div className="mb-2 text-label text-ink-2">Entity type</div>
        <Segmented
          value={entityType}
          onValueChange={(v) => pickEntity(v as EntityType)}
          options={ENTITY_OPTIONS}
          ariaLabel="Entity type"
        />
        <p className="mt-2 text-caption text-ink-3">
          Drives the documents collected, the registries checked, and the ownership depth.
        </p>
      </div>

      <SectionCard title="Anchor identifier" description="One ID prefills the rest of the application.">
        <div className="mb-3">
          <Segmented
            value={anchorKind}
            onValueChange={(v) => {
              setAnchorKind(v as AnchorKind)
              setLookup({ kind: 'idle' })
            }}
            options={ANCHOR_OPTIONS}
            ariaLabel="Anchor type"
          />
        </div>
        <Input
          label={ANCHOR_OPTIONS.find((o) => o.value === anchorKind)?.label}
          mono
          autoCapitalize="characters"
          placeholder={ANCHOR_PLACEHOLDER[anchorKind]}
          value={anchor}
          onChange={(e) => {
            setAnchor(e.target.value.toUpperCase())
            setLookup({ kind: 'idle' })
          }}
          error={anchorError}
          hint={anchorError ? undefined : 'Try ABKPS4321F to prefill from a demo business.'}
        />

        {lookup.kind === 'matched' && (
          <div className="mt-3 rounded-md border border-ok/30 bg-ok-bg p-3">
            <div className="flex items-center gap-1.5 text-label text-ok">
              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
              Found a match
            </div>
            <div className="mt-1.5 text-c-body font-medium text-ink">
              {lookup.tradeName ?? lookup.name}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-caption text-ink-3">
                Declared {formatINRCompact(lookup.turnover)}
              </span>
              <TierChip tier={lookup.tier as never} />
            </div>
          </div>
        )}

        {lookup.kind === 'duplicate' && (
          <div className="mt-3 rounded-md border border-warn/30 bg-warn-bg p-3">
            <div className="flex items-center gap-1.5 text-label text-warn">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
              Already onboarded
            </div>
            <div className="mt-1.5 text-c-body text-ink">
              {lookup.name} already has a {lookup.stage.replace('_', ' ')} profile.
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => navigate(`/console/applications`)}
            >
              Open existing profile
            </Button>
          </div>
        )}

        {lookup.kind === 'none' && (
          <p className="mt-3 text-caption text-ink-3">
            No existing record — you can capture the details manually.
          </p>
        )}
        {lookup.kind === 'error' && (
          <p className="mt-3 text-caption text-risk">A source didn't respond. Retry the lookup.</p>
        )}
      </SectionCard>

      <SectionCard title="Channel">
        <Segmented value={channel} onValueChange={setChannel} options={CHANNEL_OPTIONS} ariaLabel="Channel" />
      </SectionCard>

      {anchorKind === 'pan' && anchor === 'ABKPS4321F' && (
        <p className="px-1 text-caption text-ink-3">
          Anchor <IdChip kind="PAN" value="ABKPS4321F" showLabel={false} className="align-middle" /> →
          Saanvi Textiles (the speed case).
        </p>
      )}
    </PhoneShell>
  )
}

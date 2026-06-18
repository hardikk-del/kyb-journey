import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, Landmark, FileBarChart, Info } from 'lucide-react'
import { Button, SectionCard, Input, StatusPill, ChoiceCards } from '@/components'
import { validateIFSC } from '@/lib/validators'
import { formatINRCompact, formatPct } from '@/lib/format'
import { APPLICATIONS_BY_ID } from '@/data/fixtures'
import { CaptureScreen } from '../flow'
import { useOnboarding } from '../store'
import type { PennyDrop } from '../draft'
import { NameMismatch } from '../components'

export function FinancialsStep() {
  const draft = useOnboarding((s) => s.current())
  const update = useOnboarding((s) => s.update)
  const [account, setAccount] = useState(draft?.account?.number ?? '50100' + '118872231'.slice(0, 9))
  const [ifsc, setIfsc] = useState(draft?.account?.ifsc ?? 'HDFC0001289')
  const [running, setRunning] = useState(false)

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  const ifscError = validateIFSC(ifsc).message
  const penny = draft.pennyDrop

  function runPennyDrop() {
    setRunning(true)
    update({ account: { number: account, ifsc } })
    // Result is deterministic per fixture (Maa Durga has a name mismatch).
    const src = draft!.sourceAppId ? APPLICATIONS_BY_ID[draft!.sourceAppId] : undefined
    const pd = src?.checks.find((c) => c.label.toLowerCase().includes('penny-drop'))
    setTimeout(() => {
      setRunning(false)
      let next: PennyDrop
      if (pd?.status === 'flag') {
        next = {
          status: 'mismatch',
          registeredName: draft!.legalName,
          accountName: draft!.legalName?.replace(/s$/, ''),
        }
      } else {
        next = { status: 'match', registeredName: draft!.legalName, accountName: draft!.legalName }
      }
      update({ pennyDrop: next })
    }, 1300)
  }

  const exposure = draft.exposure ?? 0
  const share = draft.bankShare

  return (
    <CaptureScreen step="financials" title="Bank account" primaryDisabled={penny.status === 'idle' || penny.status === 'running'}>
      <p className="text-c-body text-ink-2">
        Add the settlement account for a penny-drop name match. The exposure check runs behind the
        scenes for the account gate.
      </p>

      <SectionCard title="Settlement account">
        <div className="space-y-3">
          <Input label="Account number" mono inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value)} />
          <Input label="IFSC" mono autoCapitalize="characters" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} error={ifscError} />
          <Button
            block
            variant="secondary"
            onClick={runPennyDrop}
            loading={running}
            disabled={!account || !!ifscError}
          >
            <Landmark className="h-4 w-4" strokeWidth={1.75} />
            {penny.status === 'idle' ? 'Run penny-drop' : 'Re-run penny-drop'}
          </Button>

          {penny.status === 'match' && (
            <div className="flex items-center gap-2 rounded-md bg-ok-bg px-3 py-2 text-c-body text-ok">
              <Check className="h-4 w-4" strokeWidth={2} />
              Name match — {penny.accountName}
            </div>
          )}
          {penny.status === 'mismatch' && penny.registeredName && penny.accountName && (
            <NameMismatch
              labelA="Firm name"
              a={penny.registeredName}
              labelB="Account name"
              b={penny.accountName}
            />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Account aggregator (optional)" description="Share a statement to refine the tier">
        <ChoiceCards
          value={draft.aaConsent}
          onValueChange={(v) => update({ aaConsent: v as never })}
          ariaLabel="AA consent"
          options={[
            { value: 'shared', title: 'Share via Account Aggregator', description: 'Pulls a verified statement to confirm turnover.' },
            { value: 'declined', title: 'Skip for now', description: 'Proceed on declared turnover; tier unchanged.' },
          ]}
        />
        {draft.aaConsent === 'declined' && (
          <p className="mt-2 text-caption text-ink-3">Proceeding on declared turnover.</p>
        )}
      </SectionCard>

      <SectionCard title="Exposure check">
        <div className="flex items-start gap-2">
          <FileBarChart className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.75} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-c-body text-ink">Aggregate exposure (CRILC)</span>
              <span className="font-mono tnum text-c-body text-ink">{formatINRCompact(exposure)}</span>
            </div>
            {share !== undefined && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-caption text-ink-3">Our share</span>
                <span className="font-mono tnum text-caption text-ink-2">{formatPct(share, { fraction: true })}</span>
              </div>
            )}
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-sunken px-3 py-2 text-caption text-ink-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.75} />
              Feeds the current-account exposure gate at approval.
            </div>
          </div>
        </div>
        <div className="mt-2">
          <StatusPill tone="info">Runs at approval</StatusPill>
        </div>
      </SectionCard>
    </CaptureScreen>
  )
}

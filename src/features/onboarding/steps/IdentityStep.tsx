import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, ChevronRight, ShieldAlert, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, SectionCard, StatusPill, Sheet, ChoiceCards } from '@/components'
import { checkStatusMeta } from '@/lib/status'
import {
  IDENTITY_PATH_LABEL,
  type CheckStatus,
  type IdentityPath,
  type Person,
} from '@/data/types'
import { CaptureScreen } from '../flow'
import { useOnboarding } from '../store'

const VCIP_STEPS = ['Connect call', 'Liveness check', 'Capture & match', 'Officer confirm']

const PATH_OPTIONS = [
  { value: 'biometric', title: 'In-person biometric', description: 'Full KYC. Highest assurance; no limit constraints.' },
  { value: 'vcip', title: 'V-CIP', description: 'Video KYC — connect, liveness, capture, match. Full KYC.' },
  { value: 'otp_ekyc', title: 'OTP e-KYC', description: 'Non-face-to-face → enhanced due diligence + limited account until lifted.' },
]

export function IdentityStep() {
  const draft = useOnboarding((s) => s.current())
  const setIdentityPath = useOnboarding((s) => s.setIdentityPath)
  const update = useOnboarding((s) => s.update)
  const [openId, setOpenId] = useState<string | null>(null)
  const [vcipProgress, setVcipProgress] = useState(0)
  const [running, setRunning] = useState(false)

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  const person = draft.people.find((p) => p.id === openId) ?? null
  const path = person ? (draft.identityPaths[person.id] ?? person.identityPath) : undefined
  const allVerified = draft.people.every((p) => p.kyc === 'pass' || p.kyc === 'flag')

  function setKyc(personId: string, kyc: CheckStatus) {
    update({ people: draft!.people.map((p) => (p.id === personId ? { ...p, kyc } : p)) })
  }

  function runVerification() {
    if (!person || !path) return
    if (path === 'vcip') {
      setRunning(true)
      setVcipProgress(0)
      let i = 0
      const tick = () => {
        i += 1
        setVcipProgress(i)
        if (i < VCIP_STEPS.length) {
          setTimeout(tick, 650)
        } else {
          setRunning(false)
          setKyc(person.id, 'pass')
        }
      }
      setTimeout(tick, 650)
    } else if (path === 'otp_ekyc') {
      setRunning(true)
      setTimeout(() => {
        setRunning(false)
        setKyc(person.id, 'flag') // OTP path carries an EDD flag
      }, 1100)
    } else {
      setRunning(true)
      setTimeout(() => {
        setRunning(false)
        setKyc(person.id, 'pass')
      }, 900)
    }
  }

  function statusFor(p: Person): { status: CheckStatus; label: string } {
    const s = p.kyc ?? 'pending'
    return { status: s, label: checkStatusMeta(s).label }
  }

  return (
    <CaptureScreen step="identity" title="Identity verification" primaryDisabled={!allVerified}>
      <p className="text-c-body text-ink-2">
        Verify each person's identity. The path taken sets the account's limits.
      </p>

      <SectionCard title="People" bodyClassName="p-0">
        <div className="divide-y divide-line">
          {draft.people.map((p) => {
            const st = statusFor(p)
            const pPath = draft.identityPaths[p.id] ?? p.identityPath
            return (
              <button
                key={p.id}
                onClick={() => {
                  setOpenId(p.id)
                  setVcipProgress(p.kyc === 'pass' ? VCIP_STEPS.length : 0)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-caption font-medium text-ink-2">
                  {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-c-body font-medium text-ink">{p.name}</span>
                  <span className="text-caption text-ink-3">
                    {pPath ? IDENTITY_PATH_LABEL[pPath] : 'Choose a path'}
                  </span>
                </span>
                <StatusPill tone={checkStatusMeta(st.status).tone}>{st.label}</StatusPill>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.75} />
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Identity checks" description="Run per person and rolled into the score">
        <ul className="space-y-2 text-c-body text-ink-2">
          {['Aadhaar e-KYC (DigiLocker / OTP)', 'PAN validation', 'PAN–Aadhaar link', 'Face match / liveness'].map((c) => (
            <li key={c} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />
              {c}
            </li>
          ))}
        </ul>
      </SectionCard>

      <Sheet
        open={!!person}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={person?.name}
        description="Identity verification path"
        footer={
          person && (
            <Button
              block
              onClick={person.kyc === 'pass' || person.kyc === 'flag' ? () => setOpenId(null) : runVerification}
              loading={running}
              disabled={!path}
            >
              {person.kyc === 'pass' || person.kyc === 'flag'
                ? 'Done'
                : path === 'vcip'
                  ? 'Start V-CIP'
                  : path === 'otp_ekyc'
                    ? 'Send OTP e-KYC'
                    : 'Confirm biometric capture'}
            </Button>
          )
        }
      >
        {person && (
          <div className="space-y-3 pb-2">
            <ChoiceCards
              value={path}
              onValueChange={(v) => setIdentityPath(person.id, v as IdentityPath)}
              ariaLabel="Identity path"
              options={PATH_OPTIONS}
            />

            {path === 'otp_ekyc' && (
              <div className="flex items-start gap-2 rounded-md border border-warn/30 bg-warn-bg p-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" strokeWidth={1.75} />
                <div className="text-caption text-warn">
                  OTP e-KYC is non-face-to-face. The account opens with <b>enhanced due diligence and
                  lower limits</b>; an in-person or V-CIP step lifts them later.
                </div>
              </div>
            )}

            {path === 'vcip' && (
              <div className="rounded-md border border-line p-3">
                <div className="mb-2 text-label text-ink-2">V-CIP progress</div>
                <ol className="space-y-2">
                  {VCIP_STEPS.map((s, i) => {
                    const done = i < vcipProgress
                    const active = i === vcipProgress && running
                    return (
                      <li key={s} className="flex items-center gap-2 text-c-body">
                        <span
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full',
                            done ? 'bg-ok text-white' : active ? 'bg-brand-50 text-brand-600' : 'bg-sunken text-ink-3',
                          )}
                        >
                          {done ? (
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          ) : active ? (
                            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
                          ) : (
                            <span className="text-[10px] tnum">{i + 1}</span>
                          )}
                        </span>
                        <span className={done ? 'text-ink' : 'text-ink-2'}>{s}</span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            {person.notes?.map((n) => (
              <p key={n} className="rounded-md bg-sunken px-3 py-2 text-caption text-ink-2">
                {n}
              </p>
            ))}
          </div>
        )}
      </Sheet>
    </CaptureScreen>
  )
}

import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { PhoneShell } from '@/app/PhoneShell'
import { Button, EmptyState } from '@/components'
import { useOnboarding } from '../store'

/**
 * Placeholder hand-off after Submit. The parallel-check risk-score assembly
 * (signature moment #1) and the four outcomes are built in Phase 4; this keeps
 * the flow honest and navigable in the meantime.
 */
export function VerifyHandoff() {
  const draft = useOnboarding((s) => s.current())
  const navigate = useNavigate()
  if (!draft) return <Navigate to="/onboarding" replace />

  return (
    <PhoneShell title="Verifying" onBack={() => navigate('/onboarding/review')}>
      <div className="flex flex-col items-center pt-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <h2 className="mt-3 text-section text-ink">Submitted for verification</h2>
        <p className="mt-1 text-c-body text-ink-3">
          {draft.tradeName || draft.legalName} is queued. The six pillars run in parallel into one
          risk score.
        </p>
      </div>
      <div className="mt-4">
        <EmptyState
          title="The risk-score assembly + outcome arrive in Phase 4."
          action={
            <Button size="sm" variant="secondary" onClick={() => navigate('/console/applications')}>
              View in the bank console
            </Button>
          }
        />
      </div>
    </PhoneShell>
  )
}

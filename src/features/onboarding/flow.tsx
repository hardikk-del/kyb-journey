/** Flow scaffolding: device-frame layout, step navigation, and the shared
 *  CaptureScreen wrapper that gives every step the phone chrome (app bar,
 *  progress, case chip, bottom action bar). */
import { Outlet, useNavigate } from 'react-router-dom'
import { PhoneFrame } from '@/app/PhoneFrame'
import { PhoneShell } from '@/app/PhoneShell'
import { Button } from '@/components'
import { ENTITY_LABEL } from '@/data/types'
import { TierChip } from './components'
import { useOnboarding } from './store'
import { CAPTURE_STEPS, STEPS, stepIndex, type StepId } from './draft'

export function OnboardingLayout() {
  return (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  )
}

export function useFlowNav() {
  const navigate = useNavigate()
  const path = (id: StepId) => (id === 'start' ? '/onboarding' : `/onboarding/${id}`)
  const goStep = (id: StepId) => navigate(path(id))
  const next = (from: StepId) => {
    const i = stepIndex(from)
    const n = STEPS[i + 1]
    if (n) goStep(n.id)
  }
  const back = (from: StepId) => {
    const i = stepIndex(from)
    if (i <= 0) {
      navigate('/')
      return
    }
    goStep(STEPS[i - 1].id)
  }
  return { goStep, next, back }
}

/** The case chip shown under the app bar once entity + tier are known. */
function CaseChip() {
  const draft = useOnboarding((s) => s.current())
  if (!draft?.entityType) return null
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-caption text-ink-2">
        {draft.tradeName || draft.legalName || ENTITY_LABEL[draft.entityType]}
        <span className="text-ink-3"> · {ENTITY_LABEL[draft.entityType]}</span>
      </span>
      {draft.tier && <TierChip tier={draft.tier} />}
    </div>
  )
}

export interface CaptureScreenProps {
  step: StepId
  title: string
  children: React.ReactNode
  /** Primary action label; defaults to "Continue". */
  primaryLabel?: string
  onPrimary?: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  /** Hide the bottom action bar entirely (e.g. a sub-flow handles its own). */
  hideActions?: boolean
  /** Replace the default secondary/primary pair with custom bar content. */
  actions?: React.ReactNode
}

export function CaptureScreen({
  step,
  title,
  children,
  primaryLabel = 'Continue',
  onPrimary,
  primaryDisabled,
  primaryLoading,
  hideActions,
  actions,
}: CaptureScreenProps) {
  const { next, back } = useFlowNav()
  const markFurthest = useOnboarding((s) => s.markFurthest)
  const captureIdx = CAPTURE_STEPS.indexOf(step)
  const showProgress = captureIdx >= 0

  const handlePrimary = () => {
    markFurthest(step)
    if (onPrimary) onPrimary()
    else next(step)
  }

  return (
    <PhoneShell
      title={title}
      onBack={() => back(step)}
      progress={showProgress ? { current: captureIdx + 1, total: CAPTURE_STEPS.length } : undefined}
      caseChip={<CaseChip />}
      actions={
        hideActions ? undefined : actions ? (
          actions
        ) : (
          <Button block onClick={handlePrimary} disabled={primaryDisabled} loading={primaryLoading}>
            {primaryLabel}
          </Button>
        )
      }
    >
      {children}
    </PhoneShell>
  )
}

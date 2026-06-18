import { useNavigate } from 'react-router-dom'
import { PhoneFrame } from '../PhoneFrame'
import { PhoneShell } from '../PhoneShell'
import { Button, EmptyState, StatusPill } from '@/components'

/** Honest placeholder inside the real phone shell + device frame. Demonstrates
 *  the app bar, progress, case chip and bottom action bar ahead of Phase 3. */
export function OnboardingPlaceholder() {
  const navigate = useNavigate()
  return (
    <PhoneFrame>
      <PhoneShell
        title="Start"
        onBack={() => navigate('/')}
        progress={{ current: 1, total: 7 }}
        caseChip={
          <div className="flex items-center justify-between">
            <span className="text-caption text-ink-3">New application</span>
            <StatusPill tone="info">Simplified DD</StatusPill>
          </div>
        }
        actions={
          <Button block onClick={() => navigate('/kitchen-sink')}>
            View the design system
          </Button>
        }
      >
        <EmptyState title="The capture flow is built in Phase 3." />
      </PhoneShell>
    </PhoneFrame>
  )
}

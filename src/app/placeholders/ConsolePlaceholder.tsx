import { ConsoleShell } from '../ConsoleShell'
import { EmptyState, Button } from '@/components'
import { useNavigate } from 'react-router-dom'

/** Honest placeholder inside the real console shell. The shell, nav, topbar and
 *  breadcrumbs are live; the page body lands in a later phase. */
export function ConsolePlaceholder({ page }: { page: string }) {
  const navigate = useNavigate()
  return (
    <ConsoleShell breadcrumbs={[{ label: 'Console', to: '/console' }, { label: page }]}>
      <h1 className="text-c-page text-ink">{page}</h1>
      <p className="mt-1 text-c-body text-ink-3">Desktop officer surface.</p>
      <div className="mt-6">
        <EmptyState
          title={`${page} is built in a later phase of the plan.`}
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate('/kitchen-sink')}>
              View the design system
            </Button>
          }
        />
      </div>
    </ConsoleShell>
  )
}

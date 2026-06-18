import { useState } from 'react'
import { Camera, MapPin, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components'
import { CaptureScreen, useFlowNav } from '../flow'
import { useOnboarding } from '../store'

interface Perm {
  key: 'camera' | 'location'
  icon: typeof Camera
  title: string
  purpose: string
}

const PERMS: Perm[] = [
  { key: 'camera', icon: Camera, title: 'Camera', purpose: 'Capture documents, the selfie and premises photos.' },
  { key: 'location', icon: MapPin, title: 'Location', purpose: 'Geo-tag the premises check against the registered address.' },
]

/** Quick, skippable device permissions. Native pattern — not two full screens. */
export function PermissionsStep() {
  const { next } = useFlowNav()
  const markFurthest = useOnboarding((s) => s.markFurthest)
  const [granted, setGranted] = useState<Record<string, boolean>>({})

  const proceed = () => {
    markFurthest('permissions')
    next('permissions')
  }

  return (
    <CaptureScreen
      step="permissions"
      title="Device permissions"
      actions={
        <div className="flex w-full items-center gap-3">
          <Button variant="ghost" onClick={proceed}>
            Skip
          </Button>
          <Button block onClick={proceed}>
            Continue
          </Button>
        </div>
      }
    >
      <p className="text-c-body text-ink-2">
        Grant access so the agent can capture verification evidence. You can skip and grant later.
      </p>
      <div className="space-y-3">
        {PERMS.map((p) => {
          const Icon = p.icon
          const on = granted[p.key]
          return (
            <div key={p.key} className="flex items-start gap-3 rounded-md border border-line bg-surface p-4">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                  on ? 'bg-ok-bg text-ok' : 'bg-sunken text-ink-3',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-c-body font-medium text-ink">{p.title}</div>
                <div className="mt-0.5 text-caption text-ink-3">{p.purpose}</div>
              </div>
              <Button
                size="sm"
                variant={on ? 'secondary' : 'primary'}
                onClick={() => setGranted((g) => ({ ...g, [p.key]: true }))}
                disabled={on}
              >
                {on ? (
                  <>
                    <Check className="h-3.5 w-3.5" strokeWidth={2} /> Allowed
                  </>
                ) : (
                  'Allow'
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </CaptureScreen>
  )
}

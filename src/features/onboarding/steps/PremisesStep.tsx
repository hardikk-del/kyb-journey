import { Navigate } from 'react-router-dom'
import { MapPin, Check } from 'lucide-react'
import { SectionCard, Segmented, StatusPill } from '@/components'
import { CaptureScreen } from '../flow'
import { useOnboarding } from '../store'
import { CameraCapture } from '../components'

export function PremisesStep() {
  const draft = useOnboarding((s) => s.current())
  const update = useOnboarding((s) => s.update)

  if (!draft || !draft.entityType) return <Navigate to="/onboarding" replace />

  const prem = draft.premises
  const fatca = draft.fatca
  const bothCaptured = prem.shopFront && prem.nameBoard
  const fatcaDone = fatca.foreignTaxResident !== undefined && fatca.hasBeneficialOwnerOver25 !== undefined

  function setPrem(patch: Partial<typeof prem>) {
    update({ premises: { ...prem, ...patch } })
  }
  function setFatca(patch: Partial<typeof fatca>) {
    update({ fatca: { ...fatca, ...patch } })
  }

  return (
    <CaptureScreen step="premises" title="Premises & FATCA" primaryDisabled={!bothCaptured || !fatcaDone}>
      <SectionCard title="Registered address">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.75} />
          <div className="flex-1">
            <p className="text-c-body text-ink">{draft.registeredAddress}</p>
            {prem.shopFront && (
              <div className="mt-2">
                <StatusPill tone="ok">{prem.geoNote ?? 'Within 120 m of registered address'}</StatusPill>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Shop-front photo" description="Geo-tagged & time-stamped">
        <CameraCapture
          label="shop-front"
          hint="Capture the premises with the surroundings visible."
          captured={prem.shopFront}
          onCapture={() => setPrem({ shopFront: true, geoNote: 'Within 120 m of registered address' })}
        />
      </SectionCard>

      <SectionCard title="Name-board photo" description="Confirms business existence">
        <CameraCapture
          label="name board"
          hint="Capture the signboard / nameplate at the premises."
          captured={prem.nameBoard}
          onCapture={() => setPrem({ nameBoard: true })}
        />
      </SectionCard>

      <SectionCard title="FATCA declaration">
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-label text-ink-2">Tax resident outside India?</div>
            <Segmented
              value={fatca.foreignTaxResident === undefined ? undefined : fatca.foreignTaxResident ? 'yes' : 'no'}
              onValueChange={(v) => setFatca({ foreignTaxResident: v === 'yes' })}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
              ariaLabel="Foreign tax resident"
            />
          </div>
          <div>
            <div className="mb-2 text-label text-ink-2">Beneficial owner holding ≥ 25%?</div>
            <Segmented
              value={fatca.hasBeneficialOwnerOver25 === undefined ? undefined : fatca.hasBeneficialOwnerOver25 ? 'yes' : 'no'}
              onValueChange={(v) => setFatca({ hasBeneficialOwnerOver25: v === 'yes' })}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
              ariaLabel="Beneficial owner over 25 percent"
            />
          </div>
          {fatca.foreignTaxResident && (
            <p className="rounded-md bg-warn-bg px-3 py-2 text-caption text-warn">
              Foreign tax residency requires the FATCA annexure and blocks auto-approval.
            </p>
          )}
        </div>
      </SectionCard>

      {bothCaptured && fatcaDone && (
        <div className="flex items-center gap-2 rounded-md bg-ok-bg px-3 py-2 text-c-body text-ok">
          <Check className="h-4 w-4" strokeWidth={2} />
          Premises captured and FATCA recorded.
        </div>
      )}
    </CaptureScreen>
  )
}

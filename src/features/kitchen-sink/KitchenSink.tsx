import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Button,
  StatusPill,
  IdChip,
  SectionCard,
  StatCard,
  EmptyState,
  Skeleton,
  SkeletonLines,
  Input,
  SelectField,
  Segmented,
  ChoiceCards,
  CheckField,
  Sheet,
  Tooltip,
  Tabs,
  TabPanel,
  ProgressBar,
  Stepper,
  DataTable,
  RiskGauge,
  toast,
  type Column,
} from '@/components'
import { formatINR, formatINRCompact } from '@/lib/format'
import { validatePAN } from '@/lib/validators'

/* ---------- a small grid wrapper for swatches/specimens ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-line py-3 last:border-0 sm:grid-cols-[160px_1fr] sm:items-center">
      <div className="text-c-table uppercase tracking-wide text-ink-3">{label}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

interface QueueRow {
  id: string
  business: string
  type: string
  exposure: number
  band: 'low' | 'medium' | 'high'
}

const QUEUE: QueueRow[] = [
  { id: 'AP-1', business: 'Saanvi Textiles', type: 'Proprietorship', exposure: 3_800_000, band: 'low' },
  { id: 'AP-2', business: 'Greenleaf Organics LLP', type: 'LLP', exposure: 62_00_000, band: 'medium' },
  { id: 'AP-3', business: 'Vertex Trading Pvt Ltd', type: 'Private Limited', exposure: 2_40_00_000, band: 'high' },
]

export function KitchenSink() {
  const [pan, setPan] = useState('ABKPS4321F')
  const [entity, setEntity] = useState('prop')
  const [idMethod, setIdMethod] = useState('digilocker')
  const [consent, setConsent] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  const panError = validatePAN(pan).ok ? undefined : validatePAN(pan).message

  const columns: Column<QueueRow>[] = [
    { key: 'business', header: 'Business', cell: (r) => <span className="font-medium">{r.business}</span>, sortValue: (r) => r.business },
    { key: 'type', header: 'Type', cell: (r) => <span className="text-ink-2">{r.type}</span> },
    { key: 'exposure', header: 'Exposure', align: 'right', cell: (r) => formatINRCompact(r.exposure), sortValue: (r) => r.exposure },
    {
      key: 'band',
      header: 'Risk',
      cell: (r) => (
        <StatusPill tone={r.band === 'low' ? 'ok' : r.band === 'medium' ? 'warn' : 'risk'}>
          {r.band[0].toUpperCase() + r.band.slice(1)}
        </StatusPill>
      ),
      sortValue: (r) => r.band,
    },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-content px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-c-body text-ink-3 hover:text-ink-2">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Home
        </Link>
        <h1 className="mt-3 text-c-page text-ink">Kitchen sink</h1>
        <p className="mt-1 text-c-body text-ink-3">
          Design tokens and every primitive in its states. The reference for production-grade
          consistency before feature work.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* color tokens */}
          <SectionCard title="Color tokens" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {[
                ['paper', 'bg-paper border-line'],
                ['surface', 'bg-surface border-line'],
                ['sunken', 'bg-sunken border-line'],
                ['line-strong', 'bg-line-strong border-line'],
                ['ink', 'bg-ink border-ink'],
                ['ink-2', 'bg-ink-2 border-ink'],
                ['brand-700', 'bg-brand-700 border-brand-700'],
                ['brand-600', 'bg-brand-600 border-brand-600'],
                ['brand-500', 'bg-brand-500 border-brand-500'],
                ['brand-50', 'bg-brand-50 border-line'],
                ['ok', 'bg-ok border-ok'],
                ['warn', 'bg-warn border-warn'],
                ['risk', 'bg-risk border-risk'],
                ['ok-bg', 'bg-ok-bg border-line'],
                ['warn-bg', 'bg-warn-bg border-line'],
                ['risk-bg', 'bg-risk-bg border-line'],
              ].map(([name, cls]) => (
                <div key={name}>
                  <div className={`h-12 rounded-md border ${cls}`} />
                  <div className="mt-1 font-mono text-[11px] text-ink-3">{name}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* typography */}
          <SectionCard title="Typography">
            <div className="space-y-2">
              <p className="text-title text-ink">Screen title · Geist 20/28</p>
              <p className="text-section text-ink">Section heading · 16/24</p>
              <p className="text-body text-ink-2">Body copy renders at 15/22 in Geist.</p>
              <p className="text-label text-ink-2">Label · 13/18/500</p>
              <p className="text-caption text-ink-3">Caption · 12/16</p>
              <p className="font-mono text-mono tnum text-ink">Mono 14/20 · 1,20,00,000 · ABKPS4321F</p>
            </div>
          </SectionCard>

          {/* buttons */}
          <SectionCard title="Buttons">
            <div className="space-y-3">
              <Row label="Variants">
                <Button onClick={() => toast('Account opened')}>Open account</Button>
                <Button variant="secondary">Request info</Button>
                <Button variant="ghost">Back</Button>
                <Button variant="destructive" onClick={() => toast('Application declined', 'risk')}>
                  Decline
                </Button>
              </Row>
              <Row label="States">
                <Button loading>Verifying</Button>
                <Button disabled>Disabled</Button>
                <Button size="sm">Small</Button>
              </Row>
            </div>
          </SectionCard>

          {/* status + ids */}
          <SectionCard title="Status pills">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="ok">Pass</StatusPill>
              <StatusPill tone="warn">Flag</StatusPill>
              <StatusPill tone="risk">Fail</StatusPill>
              <StatusPill tone="info">Verifying</StatusPill>
              <StatusPill tone="neutral">Didn't respond</StatusPill>
            </div>
          </SectionCard>

          <SectionCard title="ID chips (copyable, mono)">
            <div className="flex flex-wrap gap-2">
              <IdChip kind="PAN" value="ABKPS4321F" />
              <IdChip kind="GSTIN" value="29ABKPS4321F1Z8" />
              <IdChip kind="CIN" value="U51909KA2021PTC145678" showLabel={false} />
              <IdChip kind="Udyam" value="UDYAM-KA-03-0456712" />
              <IdChip kind="IFSC" value="HDFC0001289" />
              <IdChip kind="Account" value="50100123454471" />
            </div>
          </SectionCard>

          {/* amounts */}
          <SectionCard title="Indian amounts">
            <div className="space-y-1 font-mono text-mono tnum text-ink">
              <div>{formatINR(4250000)}</div>
              <div>{formatINR(12000000)}</div>
              <div>{formatINRCompact(24000000)}</div>
              <div>{formatINRCompact(3800000)}</div>
            </div>
          </SectionCard>

          {/* fields */}
          <SectionCard title="Form fields">
            <div className="space-y-4">
              <Input
                label="PAN"
                mono
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                error={panError}
                hint={panError ? undefined : 'Auto-validated against the PAN format.'}
              />
              <SelectField
                label="Address proof type"
                placeholder="Choose a document"
                options={[
                  { value: 'utility', label: 'Utility bill' },
                  { value: 'rent', label: 'Rent agreement' },
                  { value: 'passport', label: 'Passport' },
                ]}
              />
              <div>
                <div className="mb-1.5 text-label text-ink-2">Entity type</div>
                <Segmented
                  value={entity}
                  onValueChange={setEntity}
                  ariaLabel="Entity type"
                  options={[
                    { value: 'prop', label: 'Proprietorship' },
                    { value: 'partnership', label: 'Partnership' },
                    { value: 'llp', label: 'LLP' },
                    { value: 'pvt', label: 'Private Limited' },
                  ]}
                />
              </div>
              <div>
                <div className="mb-1.5 text-label text-ink-2">Identity method</div>
                <ChoiceCards
                  value={idMethod}
                  onValueChange={setIdMethod}
                  ariaLabel="Identity method"
                  options={[
                    { value: 'digilocker', title: 'DigiLocker', description: 'Pull Aadhaar securely from the government locker.' },
                    { value: 'otp', title: 'OTP e-KYC', description: 'Enhanced due diligence + limited account until lifted.' },
                  ]}
                />
              </div>
              <CheckField checked={consent} onCheckedChange={setConsent}>
                The customer consents to a credit bureau check to assess exposure and eligibility.
              </CheckField>
            </div>
          </SectionCard>

          {/* stat cards + gauge */}
          <SectionCard title="Stat cards">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="In queue" value="14" />
              <StatCard label="Auto-approved today" value="9" tone="ok" />
              <StatCard label="In review" value="3" tone="warn" />
              <StatCard label="Median time" value="6m" hint="vs 3–10 days today" />
            </div>
          </SectionCard>

          <SectionCard title="Risk gauge">
            <div className="flex flex-wrap items-center justify-around gap-4">
              <RiskGauge score={12} band="low" />
              <RiskGauge score={46} band="medium" />
              <RiskGauge score={88} band="high" />
              <RiskGauge score={31} band="medium" provisional />
            </div>
          </SectionCard>

          {/* progress + stepper */}
          <SectionCard title="Progress & stepper" className="lg:col-span-2">
            <div className="space-y-4">
              <ProgressBar current={3} total={7} />
              <Stepper
                current={2}
                steps={['Lead', 'Verify', 'Approve', 'Open', 'Deploy', 'Activate', 'Monitor']}
              />
            </div>
          </SectionCard>

          {/* tabs */}
          <SectionCard title="Tabs">
            <Tabs tabs={[{ value: 'risk', label: 'Risk' }, { value: 'checks', label: 'Checks' }, { value: 'people', label: 'People' }]}>
              <TabPanel value="risk" className="pt-3 text-c-body text-ink-2">
                Risk panel — gauge, six pillar sub-scores and reason codes (Phase 4).
              </TabPanel>
              <TabPanel value="checks" className="pt-3 text-c-body text-ink-2">
                Every verification with status, value and source (Phase 2).
              </TabPanel>
              <TabPanel value="people" className="pt-3 text-c-body text-ink-2">
                People & KYC with screening (Phase 6).
              </TabPanel>
            </Tabs>
          </SectionCard>

          {/* sheet + tooltip */}
          <SectionCard title="Sheet & tooltip">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                Open bottom sheet
              </Button>
              <Tooltip content="Sources: GSTN, MCA, UIDAI, penny-drop, CRILC.">
                <Button variant="ghost">Hover for sources</Button>
              </Tooltip>
              <Sheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                title="Confirm decline"
                description="A recorded reason is required."
                footer={
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSheetOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => { setSheetOpen(false); toast('Application declined', 'risk') }}>
                      Decline
                    </Button>
                  </div>
                }
              >
                <p className="text-c-body text-ink-2">
                  Reason category: ownership / network risk. This is recorded in the audit trail.
                </p>
              </Sheet>
            </div>
          </SectionCard>

          {/* skeleton + empty */}
          <SectionCard title="Loading & empty states">
            <div className="space-y-4">
              <SkeletonLines lines={3} />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
              <EmptyState
                title="No applications match these filters."
                action={<Button size="sm" variant="secondary">Clear filters</Button>}
              />
            </div>
          </SectionCard>

          {/* data table */}
          <SectionCard
            title="Data table"
            action={
              <Button size="sm" variant="secondary" onClick={() => { setTableLoading(true); setTimeout(() => setTableLoading(false), 1200) }}>
                Reload
              </Button>
            }
            className="lg:col-span-2"
          >
            <DataTable columns={columns} rows={QUEUE} rowKey={(r) => r.id} loading={tableLoading} onRowClick={(r) => toast(`Opened ${r.business}`)} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

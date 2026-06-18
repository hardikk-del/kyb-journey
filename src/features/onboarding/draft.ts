/**
 * The capture draft — the working state of an in-progress onboarding. It mirrors
 * the parts of an Application a field agent captures, plus the flow's progress.
 * When the anchor identifier matches a fixture, the draft is hydrated from it
 * (smart prefill) and `sourceAppId` lets Verify (Phase 4) pull the scripted
 * checks/outcome for that business.
 */
import type {
  BeneficialOwner,
  Channel,
  Document,
  EntityType,
  IdentityPath,
  Person,
  Tier,
} from '@/data/types'

export type AnchorKind = 'pan' | 'gstin' | 'mobile'

export type StepId =
  | 'start'
  | 'permissions'
  | 'business'
  | 'people'
  | 'documents'
  | 'identity'
  | 'financials'
  | 'premises'
  | 'review'

export interface PennyDrop {
  status: 'idle' | 'running' | 'match' | 'mismatch' | 'fail'
  registeredName?: string
  accountName?: string
}

export interface FatcaDeclaration {
  foreignTaxResident?: boolean
  hasBeneficialOwnerOver25?: boolean
}

export interface PremisesCapture {
  shopFront?: boolean
  nameBoard?: boolean
  addressConfirmed?: boolean
  /** Geo distance note vs declared address. */
  geoNote?: string
}

export interface Draft {
  id: string
  sourceAppId?: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'submitted'

  // Lead
  entityType?: EntityType
  anchorKind: AnchorKind
  anchor: string
  channel: Channel
  tier?: Tier

  // Business
  legalName?: string
  tradeName?: string
  entityPan?: string
  gstin?: string
  cin?: string
  llpin?: string
  udyam?: string
  registeredAddress?: string
  state?: string
  declaredTurnover?: number
  exposure?: number
  bankShare?: number
  /** Which fields were prefilled from a registry (for source tags). */
  prefilledFrom?: Partial<Record<string, 'GSTN' | 'MCA' | 'NSDL' | 'Internal'>>

  // People & ownership
  people: Person[]
  beneficialOwners: BeneficialOwner[]

  // Documents
  documents: Document[]
  docChannel: 'SMS' | 'WhatsApp'

  // Identity
  identityPaths: Record<string, IdentityPath>

  // Financials
  account?: { number: string; ifsc: string }
  pennyDrop: PennyDrop
  aaConsent?: 'pending' | 'shared' | 'declined'

  // Premises & FATCA
  premises: PremisesCapture
  fatca: FatcaDeclaration

  // Progress
  furthestStep: StepId
}

export const STEPS: { id: StepId; title: string }[] = [
  { id: 'start', title: 'Start' },
  { id: 'permissions', title: 'Permissions' },
  { id: 'business', title: 'Business details' },
  { id: 'people', title: 'People & ownership' },
  { id: 'documents', title: 'Documents' },
  { id: 'identity', title: 'Identity' },
  { id: 'financials', title: 'Bank account' },
  { id: 'premises', title: 'Premises & FATCA' },
  { id: 'review', title: 'Review' },
]

export const stepIndex = (id: StepId): number => STEPS.findIndex((s) => s.id === id)

/** Steps shown in the progress bar (Start/permissions collapse into stage 1). */
export const CAPTURE_STEPS: StepId[] = [
  'business',
  'people',
  'documents',
  'identity',
  'financials',
  'premises',
  'review',
]

/** Entity-type-specific configuration: which people roles, docs and id fields. */
export interface EntityProfile {
  /** Anchor the Lead step asks for first. */
  primaryAnchor: AnchorKind
  /** Identity fields shown on the Business step. */
  idFields: ('entityPan' | 'gstin' | 'cin' | 'llpin' | 'udyam')[]
  peopleRoleLabel: string
  /** Whether the people set involves DIN/DPIN. */
  usesDin: boolean
  /** Document checklist labels. */
  docs: string[]
}

export const ENTITY_PROFILE: Record<EntityType, EntityProfile> = {
  proprietorship: {
    primaryAnchor: 'pan',
    idFields: ['entityPan', 'gstin', 'udyam'],
    peopleRoleLabel: 'Proprietor',
    usesDin: false,
    docs: ['PAN card', 'One OVD (Aadhaar/Passport)', 'Business-existence proof'],
  },
  partnership: {
    primaryAnchor: 'gstin',
    idFields: ['entityPan', 'gstin', 'udyam'],
    peopleRoleLabel: 'Partners',
    usesDin: false,
    docs: ['Partnership deed', 'Firm PAN', "Partners' PAN + OVD", 'Authorisation letter', 'GST certificate', 'Address proof'],
  },
  llp: {
    primaryAnchor: 'gstin',
    idFields: ['llpin', 'entityPan', 'gstin'],
    peopleRoleLabel: 'Designated partners',
    usesDin: true,
    docs: ['Incorporation certificate', 'LLP agreement', 'Firm PAN', "Designated partners' KYC + DIN", 'Authorisation resolution', 'GST certificate'],
  },
  pvt_ltd: {
    primaryAnchor: 'gstin',
    idFields: ['cin', 'entityPan', 'gstin'],
    peopleRoleLabel: 'Directors',
    usesDin: true,
    docs: ['Certificate of incorporation', 'MOA / AOA', 'Board resolution', 'List of directors', 'Shareholding pattern', 'Firm PAN', "Directors' KYC + DIN"],
  },
}

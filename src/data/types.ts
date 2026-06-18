/**
 * Secure ID domain model. These types are the contract between the fixtures,
 * the risk engine, the services layer and every screen.
 */
import type { CheckStatus, RiskBand } from '@/lib/status'

export type { CheckStatus, RiskBand }

/* ---------------- entities & people ---------------- */

export type EntityType = 'proprietorship' | 'partnership' | 'llp' | 'pvt_ltd'

export const ENTITY_LABEL: Record<EntityType, string> = {
  proprietorship: 'Proprietorship',
  partnership: 'Partnership firm',
  llp: 'LLP',
  pvt_ltd: 'Private Limited',
}

/** Due-diligence tier, auto-classified from declared turnover. */
export type Tier = 'simplified' | 'full'

/** How the application was sourced. */
export type Channel = 'agent' | 'branch' | 'self_serve'

/** Identity verification path taken per person — drives limits/EDD. */
export type IdentityPath = 'biometric' | 'vcip' | 'otp_ekyc'

export const IDENTITY_PATH_LABEL: Record<IdentityPath, string> = {
  biometric: 'In-person biometric',
  vcip: 'V-CIP',
  otp_ekyc: 'OTP e-KYC',
}

/** Person role within an entity. */
export type PersonRole =
  | 'proprietor'
  | 'partner'
  | 'designated_partner'
  | 'director'
  | 'shareholder'
  | 'signatory'

export interface ScreeningHit {
  kind: 'sanctions' | 'pep' | 'adverse_media'
  /** A true match is a hard concern; false positives are clearable by an officer. */
  match: 'true' | 'false_positive' | 'potential'
  detail: string
  source: string
}

export interface Person {
  id: string
  name: string
  roles: PersonRole[]
  pan?: string
  din?: string // DIN / DPIN where relevant
  /** Ownership / profit / capital share as a 0..1 fraction (undefined = N/A). */
  ownership?: number
  isSignatory?: boolean
  identityPath?: IdentityPath
  /** Per-person KYC roll-up status. */
  kyc?: CheckStatus
  screening?: ScreeningHit[]
  /** Flags surfaced in people panel (e.g. "PAN–Aadhaar not linked"). */
  notes?: string[]
  nationality?: 'IN' | 'NRI' | 'foreign'
}

/** Derived beneficial owner (against the configurable threshold). */
export interface BeneficialOwner {
  personId: string
  /** Effective ownership as a 0..1 fraction (after tracing corporate layers). */
  effectiveOwnership: number
  /** True when reached by drilling through a corporate owner. */
  viaCorporate?: boolean
}

/* ---------------- verification checks ---------------- */

export type Pillar = 'identity' | 'business' | 'financial' | 'premises' | 'ownership' | 'screening'

export const PILLAR_LABEL: Record<Pillar, string> = {
  identity: 'Identity',
  business: 'Business',
  financial: 'Financial',
  premises: 'Premises',
  ownership: 'Ownership & network',
  screening: 'Screening',
}

export const PILLARS: Pillar[] = [
  'identity',
  'business',
  'financial',
  'premises',
  'ownership',
  'screening',
]

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export type CheckSource =
  | 'GSTN'
  | 'MCA'
  | 'UIDAI'
  | 'NSDL'
  | 'Penny-drop'
  | 'CRILC'
  | 'Bureau'
  | 'NeSL'
  | 'AML'
  | 'CPV'
  | 'Internal'

export interface Check {
  id: string
  pillar: Pillar
  label: string
  /** Terminal status authored on the fixture; the verify run animates
   *  pending → this value. */
  status: CheckStatus
  severity: Severity
  /** Extracted/observed value (e.g. "Active", a name, an amount). */
  value?: string
  source: CheckSource
  /** Human-readable reason code, shown when status is flag/fail/error. */
  reason?: string
  /** Person this check pertains to (for per-person identity/screening). */
  personId?: string
  /** Forces the band to High when this check resolves non-pass. */
  hardStop?: boolean
  /** Authoring override for risk points; otherwise derived from severity. */
  points?: number
  /** Deterministic resolve time for the verify animation (ms). */
  latencyMs?: number
  /** Resolve timestamp (ISO) once verified. */
  ts?: string
}

/* ---------------- ownership / network graph ---------------- */

export type GraphNodeKind = 'entity' | 'person' | 'connected-entity' | 'attribute'

export interface GraphNode {
  id: string
  kind: GraphNodeKind
  label: string
  /** Sub-label (IDs, status like "struck off"). */
  sublabel?: string
  /** Marks a node as part of the risk surface (rendered in risk color). */
  flagged?: boolean
  /** Why it's flagged (mini-profile side panel). */
  reason?: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  flagged?: boolean
}

export interface OwnershipGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/* ---------------- documents ---------------- */

export interface DocFieldMatch {
  label: string
  extracted: string
  /** Matches captured/cross-source data. */
  match: 'match' | 'mismatch' | 'partial'
}

export interface Document {
  id: string
  label: string
  status: 'received' | 'pending' | 'requested'
  /** Simulated OCR-extracted fields cross-checked against captured data. */
  fields?: DocFieldMatch[]
  quality?: ('original' | 'not_tampered' | 'legible')[]
}

/* ---------------- decisioning & audit ---------------- */

export type ApplicationStage =
  | 'lead'
  | 'verifying'
  | 'review'
  | 'more_info'
  | 'approved'
  | 'declined'
  | 'account_opened'
  | 'deployed'
  | 'active'
  | 'monitoring'

export type Outcome = 'approved' | 'review' | 'more_info' | 'declined'

export type DecisionAction = 'approve' | 'request_info' | 'decline'

export interface Decision {
  action: DecisionAction
  /** Required reason category (regulatory expectation). */
  reasonCategory: string
  note?: string
  by: string // officer id
  ts: string
  /** Maker-checker: a senior confirmation for approvals above threshold. */
  checkedBy?: string
}

export interface AuditEvent {
  id: string
  ts: string
  actor: string
  event: string
  detail?: string
}

/** Settlement / current account once opened. */
export interface BankAccount {
  number: string // raw; display masked
  ifsc: string
  type: 'full_current' | 'collection_only'
  cbsFlagged?: boolean
}

/** A deployed acquiring instrument (POS/QR/etc.) from the same profile. */
export interface Deployment {
  kind: 'qr' | 'soundbox' | 'pos' | 'gateway'
  id: string // MID / terminal id
  label: string
}

/* ---------------- the application ---------------- */

export interface Application {
  id: string
  /** The anchor identifier used for lookup (PAN/GSTIN). */
  anchor: string
  legalName: string
  tradeName?: string
  entityType: EntityType
  tier: Tier
  channel: Channel
  /** Declared annual turnover in rupees. */
  declaredTurnover: number
  /** Aggregate banking-system exposure in rupees (for the gate). */
  exposure: number
  /** The bank's share of that exposure, 0..1 (for the ≥10% rule). */
  bankShare?: number

  // identifiers (entity-specific; only the relevant ones are set)
  entityPan?: string
  gstin?: string
  cin?: string
  llpin?: string
  udyam?: string

  registeredAddress: string
  state: string

  people: Person[]
  beneficialOwners: BeneficialOwner[]
  documents: Document[]
  checks: Check[]
  graph: OwnershipGraph

  stage: ApplicationStage
  submittedAt: string
  assignedOfficer?: string

  account?: BankAccount
  deployments?: Deployment[]
  decision?: Decision
  audit: AuditEvent[]

  /** Short, presenter-facing note on what this fixture demonstrates. */
  demoNote?: string
}

/* ---------------- monitoring ---------------- */

export interface MonitoringPoint {
  /** Bucket label (e.g. a date or "W-3"). */
  t: string
  volume: number
}

export interface MonitoredMerchant {
  applicationId: string
  legalName: string
  liveBand: RiskBand
  startBand: RiskBand
  trend: MonitoringPoint[]
  alert?: { title: string; detail: string; severity: Severity }
  reKycDue?: string
}

/* ---------------- risk engine output ---------------- */

export interface ReasonCode {
  code: string
  label: string
  pillar: Pillar
  severity: Severity
}

export interface PillarScore {
  pillar: Pillar
  score: number // 0..100 sub-score
  weight: number
}

export interface RiskResult {
  score: number // 0..100 composite
  band: RiskBand
  pillars: PillarScore[]
  reasonCodes: ReasonCode[]
  hardStops: ReasonCode[]
  /** True while any contributing check is still pending. */
  provisional: boolean
  outcome: Outcome
}

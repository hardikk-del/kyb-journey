/**
 * The six businesses that drive the demo (05_MOCK_DATA.md). Verification is
 * deterministic per fixture: a given business always resolves to the same
 * scripted check results, so the pitch repeats identically.
 *
 * Scores are calibrated against the engine in riskEngine.ts and asserted by
 * scripts/verify-scores.ts. Target composites: Saanvi ~12, Greenleaf ~46,
 * Vertex ~88 (hard-stops), Maa Durga ~65 (more-info), Anand ~23, QuickCart ~12.
 */
import type {
  Application,
  Check,
  MonitoredMerchant,
  OwnershipGraph,
  Person,
} from './types'

/* ---------------- tiny authoring helper ---------------- */

let seq = 0
function chk(c: Omit<Check, 'id'> & { id?: string }): Check {
  return { id: c.id ?? `chk_${++seq}`, ...c }
}

const TODAY = '2026-06-18'

/* ============================================================
   1. SAANVI TEXTILES — Proprietorship — THE SPEED CASE (clean)
   ============================================================ */

const saanvi: Person = {
  id: 'p_saanvi',
  name: 'Saanvi Reddy',
  roles: ['proprietor', 'signatory'],
  pan: 'ABKPS4321F',
  ownership: 1,
  isSignatory: true,
  identityPath: 'biometric',
  kyc: 'pass',
  nationality: 'IN',
}

const saanviApp: Application = {
  id: 'app_saanvi',
  anchor: 'ABKPS4321F',
  legalName: 'Saanvi Reddy',
  tradeName: 'Saanvi Textiles',
  entityType: 'proprietorship',
  tier: 'simplified',
  channel: 'agent',
  declaredTurnover: 38_00_000,
  exposure: 38_00_000,
  bankShare: 1,
  entityPan: 'ABKPS4321F',
  gstin: '29ABKPS4321F1Z8',
  udyam: 'UDYAM-KA-03-0456712',
  registeredAddress: '24, Chickpet Main Road, Bengaluru 560053',
  state: 'Karnataka',
  people: [saanvi],
  beneficialOwners: [{ personId: 'p_saanvi', effectiveOwnership: 1 }],
  documents: [
    { id: 'd_pan', label: 'PAN card', status: 'received', quality: ['original', 'not_tampered', 'legible'], fields: [{ label: 'PAN', extracted: 'ABKPS4321F', match: 'match' }, { label: 'Name', extracted: 'Saanvi Reddy', match: 'match' }] },
    { id: 'd_ovd', label: 'Aadhaar (OVD)', status: 'received', quality: ['original', 'legible'], fields: [{ label: 'Name', extracted: 'Saanvi Reddy', match: 'match' }] },
    { id: 'd_gst', label: 'GST certificate', status: 'received', quality: ['original', 'legible'], fields: [{ label: 'GSTIN', extracted: '29ABKPS4321F1Z8', match: 'match' }] },
  ],
  checks: [
    chk({ pillar: 'identity', label: 'PAN validation', status: 'pass', severity: 'info', value: 'ABKPS4321F', source: 'NSDL', personId: 'p_saanvi', latencyMs: 900 }),
    chk({ pillar: 'identity', label: 'Aadhaar e-KYC (biometric)', status: 'pass', severity: 'info', value: 'Verified', source: 'UIDAI', personId: 'p_saanvi', latencyMs: 1600 }),
    chk({ pillar: 'identity', label: 'PAN–Aadhaar link', status: 'pass', severity: 'info', value: 'Linked', source: 'NSDL', personId: 'p_saanvi', latencyMs: 1200 }),
    chk({ pillar: 'business', label: 'GSTIN status', status: 'pass', severity: 'info', value: 'Active · returns filed', source: 'GSTN', latencyMs: 1400 }),
    chk({ pillar: 'business', label: 'Udyam registration', status: 'pass', severity: 'info', value: 'UDYAM-KA-03-0456712', source: 'Internal', latencyMs: 1000 }),
    chk({ pillar: 'business', label: 'Name match across sources', status: 'pass', severity: 'info', value: 'Saanvi Reddy', source: 'Internal', latencyMs: 1100 }),
    chk({ pillar: 'financial', label: 'Penny-drop name match', status: 'pass', severity: 'info', value: 'Match', source: 'Penny-drop', latencyMs: 1500 }),
    chk({ pillar: 'financial', label: 'Exposure (CRILC)', status: 'pass', severity: 'info', value: 'No existing facilities', source: 'CRILC', latencyMs: 1800 }),
    chk({ pillar: 'premises', label: 'Address match vs OVD', status: 'pass', severity: 'info', value: 'Match', source: 'CPV', latencyMs: 1300 }),
    chk({ pillar: 'premises', label: 'CPV (geo-photo)', status: 'pass', severity: 'info', value: 'Within 120 m', source: 'CPV', latencyMs: 2100 }),
    chk({ pillar: 'ownership', label: 'Beneficial owner', status: 'pass', severity: 'info', value: 'Saanvi Reddy · 100%', source: 'Internal', latencyMs: 900 }),
    chk({ pillar: 'screening', label: 'AML / sanctions / PEP', status: 'pass', severity: 'info', value: 'Clear', source: 'AML', personId: 'p_saanvi', latencyMs: 1700 }),
  ],
  graph: {
    nodes: [
      { id: 'e_saanvi', kind: 'entity', label: 'Saanvi Textiles', sublabel: 'Proprietorship' },
      { id: 'p_saanvi', kind: 'person', label: 'Saanvi Reddy', sublabel: 'Proprietor · 100%' },
    ],
    edges: [{ id: 'g1', source: 'p_saanvi', target: 'e_saanvi', label: 'owns 100%' }],
  },
  stage: 'lead',
  submittedAt: `${TODAY}T09:12:00+05:30`,
  audit: [],
  demoNote: 'Clean proprietorship — auto-approve in minutes, then account + QR/Soundbox.',
}

/* ============================================================
   2. GREENLEAF ORGANICS LLP — LLP — OFFICER-REVIEW (one amber)
   ============================================================ */

const arjun: Person = {
  id: 'p_arjun',
  name: 'Arjun Mehta',
  roles: ['designated_partner', 'signatory'],
  pan: 'AKMPM7711L',
  din: '09214567',
  ownership: 0.5,
  isSignatory: true,
  identityPath: 'vcip',
  kyc: 'pass',
  nationality: 'IN',
}
const kavya: Person = {
  id: 'p_kavya',
  name: 'Kavya Nair',
  roles: ['designated_partner'],
  pan: 'BNZPN4456K',
  din: '09887123',
  ownership: 0.5,
  identityPath: 'vcip',
  kyc: 'pass',
  nationality: 'IN',
}

const greenleafApp: Application = {
  id: 'app_greenleaf',
  anchor: '29AAEFG2109H1Z2',
  legalName: 'Greenleaf Organics LLP',
  tradeName: 'Greenleaf Organics',
  entityType: 'llp',
  tier: 'full',
  channel: 'branch',
  declaredTurnover: 1_20_00_000,
  exposure: 62_00_000,
  bankShare: 0.45,
  entityPan: 'AAEFG2109H',
  gstin: '29AAEFG2109H1Z2',
  llpin: 'AAF-7421',
  registeredAddress: '7, Residency Road, Bengaluru 560025',
  state: 'Karnataka',
  people: [arjun, kavya],
  beneficialOwners: [
    { personId: 'p_arjun', effectiveOwnership: 0.5 },
    { personId: 'p_kavya', effectiveOwnership: 0.5 },
  ],
  documents: [
    { id: 'd_inc', label: 'Certificate of incorporation', status: 'received', quality: ['original', 'legible'] },
    { id: 'd_llp', label: 'LLP agreement', status: 'received', quality: ['original', 'legible'] },
    { id: 'd_pan', label: 'Firm PAN', status: 'received', fields: [{ label: 'PAN', extracted: 'AAEFG2109H', match: 'match' }] },
    { id: 'd_gst', label: 'GST certificate', status: 'received', fields: [{ label: 'GSTIN', extracted: '29AAEFG2109H1Z2', match: 'match' }] },
  ],
  checks: [
    chk({ pillar: 'identity', label: 'PAN validation — Arjun Mehta', status: 'pass', severity: 'info', value: 'AKMPM7711L', source: 'NSDL', personId: 'p_arjun', latencyMs: 1000 }),
    chk({ pillar: 'identity', label: 'V-CIP — Arjun Mehta', status: 'pass', severity: 'info', value: 'Liveness + match passed', source: 'UIDAI', personId: 'p_arjun', latencyMs: 2200 }),
    chk({ pillar: 'identity', label: 'V-CIP — Kavya Nair', status: 'pass', severity: 'info', value: 'Liveness + match passed', source: 'UIDAI', personId: 'p_kavya', latencyMs: 2000 }),
    chk({ pillar: 'business', label: 'MCA LLP status', status: 'pass', severity: 'info', value: 'Active', source: 'MCA', latencyMs: 1500 }),
    chk({ pillar: 'business', label: 'DIN/DPIN validation', status: 'pass', severity: 'info', value: 'Both valid', source: 'MCA', latencyMs: 1300 }),
    chk({
      id: 'gst_filing_lapsed',
      pillar: 'business',
      label: 'GST filing history',
      status: 'flag',
      severity: 'high',
      value: 'No returns last 2 quarters',
      source: 'GSTN',
      reason: 'GST registered but returns not filed in the last 2 quarters.',
      latencyMs: 1700,
    }),
    chk({ pillar: 'financial', label: 'Penny-drop name match', status: 'pass', severity: 'info', value: 'Match', source: 'Penny-drop', latencyMs: 1400 }),
    chk({ pillar: 'financial', label: 'Exposure (CRILC)', status: 'pass', severity: 'info', value: '₹62,00,000 · 45% our share', source: 'CRILC', latencyMs: 1900 }),
    chk({ pillar: 'premises', label: 'Address match vs OVD', status: 'pass', severity: 'info', value: 'Match', source: 'CPV', latencyMs: 1200 }),
    chk({ pillar: 'ownership', label: 'Beneficial owners (>10%)', status: 'pass', severity: 'info', value: 'Arjun 50% · Kavya 50%', source: 'Internal', latencyMs: 1000 }),
    chk({ pillar: 'screening', label: 'AML / sanctions / PEP', status: 'pass', severity: 'info', value: 'Clear', source: 'AML', latencyMs: 1600 }),
  ],
  graph: {
    nodes: [
      { id: 'e_greenleaf', kind: 'entity', label: 'Greenleaf Organics LLP', sublabel: 'LLP · AAF-7421' },
      { id: 'p_arjun', kind: 'person', label: 'Arjun Mehta', sublabel: 'Designated partner · 50%' },
      { id: 'p_kavya', kind: 'person', label: 'Kavya Nair', sublabel: 'Designated partner · 50%' },
    ],
    edges: [
      { id: 'g1', source: 'p_arjun', target: 'e_greenleaf', label: 'partner · 50%' },
      { id: 'g2', source: 'p_kavya', target: 'e_greenleaf', label: 'partner · 50%' },
    ],
  },
  stage: 'review',
  submittedAt: `${TODAY}T08:40:00+05:30`,
  assignedOfficer: 'iyer',
  audit: [],
  demoNote: 'One amber flag (GST filing lapsed) → officer review, recorded reason, maker-checker.',
}

/* ============================================================
   3. VERTEX TRADING PVT LTD — Private Limited — THE FRAUD CASE
   ============================================================ */

const rakesh: Person = {
  id: 'p_rakesh',
  name: 'Rakesh Kumar',
  roles: ['director', 'signatory'],
  pan: 'AVCPK1290J',
  din: '08123456',
  ownership: 0.6,
  isSignatory: true,
  identityPath: 'otp_ekyc',
  kyc: 'flag',
  nationality: 'IN',
  screening: [
    { kind: 'adverse_media', match: 'true', detail: 'Named in reports on multiple struck-off shell entities.', source: 'Adverse media' },
  ],
  notes: ['Linked to 6 entities — 4 struck-off in MCA.'],
}
const sunita: Person = {
  id: 'p_sunita',
  name: 'Sunita Rao',
  roles: ['director'],
  pan: 'AWXPR3321M',
  din: '08456789',
  ownership: 0.4,
  identityPath: 'otp_ekyc',
  kyc: 'pass',
  nationality: 'IN',
}

const vertexGraph: OwnershipGraph = {
  nodes: [
    { id: 'e_vertex', kind: 'entity', label: 'Vertex Trading Pvt Ltd', sublabel: 'CIN …PTC145678', flagged: true, reason: 'Incorporated 4 months ago; no GST filings despite ₹2.4 Cr declared turnover.' },
    { id: 'p_rakesh', kind: 'person', label: 'Rakesh Kumar', sublabel: 'Director · signatory', flagged: true, reason: 'Linked to 6 entities; 4 struck-off.' },
    { id: 'p_sunita', kind: 'person', label: 'Sunita Rao', sublabel: 'Director' },
    { id: 'a_address', kind: 'attribute', label: 'No. 14, 2nd Cross, Lakshmi Layout', sublabel: 'Shared address', flagged: true, reason: 'Registered address shared with 5 other companies.' },
    { id: 'a_account', kind: 'attribute', label: '••••••4471', sublabel: 'Settlement account', flagged: true, reason: 'Mule-flagged (rapid in-out); shared with a struck-off entity.' },
    { id: 'c_alpha', kind: 'connected-entity', label: 'Alpha Vincom Pvt Ltd', sublabel: 'Struck off', flagged: true, reason: 'Struck off in MCA.' },
    { id: 'c_beta', kind: 'connected-entity', label: 'Beta Mercantile Pvt Ltd', sublabel: 'Struck off', flagged: true, reason: 'Struck off in MCA.' },
    { id: 'c_gamma', kind: 'connected-entity', label: 'Gamma Traders Pvt Ltd', sublabel: 'Struck off', flagged: true, reason: 'Struck off in MCA.' },
    { id: 'c_delta', kind: 'connected-entity', label: 'Delta Exim Pvt Ltd', sublabel: 'Struck off', flagged: true, reason: 'Struck off in MCA.' },
    { id: 'c_omega', kind: 'connected-entity', label: 'Omega Retail Pvt Ltd', sublabel: 'Active' },
  ],
  edges: [
    { id: 'g1', source: 'p_rakesh', target: 'e_vertex', label: 'director · 60%', flagged: true },
    { id: 'g2', source: 'p_sunita', target: 'e_vertex', label: 'director · 40%' },
    { id: 'g3', source: 'e_vertex', target: 'a_address', label: 'registered at', flagged: true },
    { id: 'g4', source: 'c_alpha', target: 'a_address', label: 'registered at', flagged: true },
    { id: 'g5', source: 'c_beta', target: 'a_address', label: 'registered at', flagged: true },
    { id: 'g6', source: 'c_gamma', target: 'a_address', label: 'registered at', flagged: true },
    { id: 'g7', source: 'c_delta', target: 'a_address', label: 'registered at', flagged: true },
    { id: 'g8', source: 'c_omega', target: 'a_address', label: 'registered at' },
    { id: 'g9', source: 'p_rakesh', target: 'c_alpha', label: 'director of', flagged: true },
    { id: 'g10', source: 'p_rakesh', target: 'c_beta', label: 'director of', flagged: true },
    { id: 'g11', source: 'e_vertex', target: 'a_account', label: 'settles to', flagged: true },
    { id: 'g12', source: 'c_gamma', target: 'a_account', label: 'settles to', flagged: true },
  ],
}

const vertexApp: Application = {
  id: 'app_vertex',
  anchor: 'U51909KA2021PTC145678',
  legalName: 'Vertex Trading Pvt Ltd',
  tradeName: 'Vertex Trading',
  entityType: 'pvt_ltd',
  tier: 'full',
  channel: 'self_serve',
  declaredTurnover: 2_40_00_000,
  exposure: 1_80_00_000,
  bankShare: 0.2,
  entityPan: 'AAGCV8765K',
  gstin: '29AAGCV8765K1Z4',
  cin: 'U51909KA2021PTC145678',
  registeredAddress: 'No. 14, 2nd Cross, Lakshmi Layout, Bengaluru 560022',
  state: 'Karnataka',
  people: [rakesh, sunita],
  beneficialOwners: [
    { personId: 'p_rakesh', effectiveOwnership: 0.6 },
    { personId: 'p_sunita', effectiveOwnership: 0.4 },
  ],
  documents: [
    { id: 'd_coi', label: 'Certificate of incorporation', status: 'received', quality: ['original', 'legible'] },
    { id: 'd_moa', label: 'MOA / AOA', status: 'received', quality: ['original', 'legible'] },
    { id: 'd_board', label: 'Board resolution', status: 'received' },
    { id: 'd_gst', label: 'GST certificate', status: 'received', fields: [{ label: 'GSTIN', extracted: '29AAGCV8765K1Z4', match: 'match' }] },
  ],
  checks: [
    chk({ pillar: 'identity', label: 'PAN validation — Rakesh Kumar', status: 'pass', severity: 'info', value: 'AVCPK1290J', source: 'NSDL', personId: 'p_rakesh', latencyMs: 1000 }),
    chk({ pillar: 'identity', label: 'OTP e-KYC — Rakesh Kumar', status: 'pass', severity: 'info', value: 'Verified (OTP)', source: 'UIDAI', personId: 'p_rakesh', latencyMs: 1400 }),
    chk({ pillar: 'identity', label: 'OTP e-KYC — Sunita Rao', status: 'pass', severity: 'info', value: 'Verified (OTP)', source: 'UIDAI', personId: 'p_sunita', latencyMs: 1300 }),
    chk({ pillar: 'business', label: 'MCA company status', status: 'pass', severity: 'info', value: 'Active', source: 'MCA', latencyMs: 1600 }),
    chk({ pillar: 'business', label: 'GSTIN status', status: 'pass', severity: 'info', value: 'Active', source: 'GSTN', latencyMs: 1500 }),
    chk({
      id: 'turnover_mismatch',
      pillar: 'business',
      label: 'GST filings vs declared turnover',
      status: 'flag',
      severity: 'high',
      points: 3,
      value: 'No filings · ₹2.4 Cr declared',
      source: 'GSTN',
      reason: 'No GST filings since incorporation despite ₹2.4 Cr declared turnover.',
      latencyMs: 1900,
    }),
    chk({ pillar: 'financial', label: 'Penny-drop name match', status: 'pass', severity: 'info', value: 'Match', source: 'Penny-drop', latencyMs: 1500 }),
    chk({
      id: 'confirmed_mule',
      pillar: 'ownership',
      label: 'Settlement account — mule signals',
      status: 'fail',
      severity: 'critical',
      points: 16,
      hardStop: true,
      value: '••••••4471 · rapid in-out',
      source: 'Internal',
      reason: 'Nominated settlement account is mule-flagged and shared with a struck-off entity.',
      latencyMs: 2300,
    }),
    chk({
      id: 'struck_off_link',
      pillar: 'ownership',
      label: 'Director — struck-off entity links',
      status: 'fail',
      severity: 'critical',
      points: 20,
      hardStop: true,
      value: 'Rakesh Kumar → 4 struck-off',
      source: 'MCA',
      reason: 'Authorised signatory is linked to four struck-off entities.',
      latencyMs: 2500,
    }),
    chk({
      id: 'shared_address',
      pillar: 'ownership',
      label: 'Registered address — shared-attribute',
      status: 'flag',
      severity: 'high',
      points: 5,
      value: 'Shared with 5 companies',
      source: 'MCA',
      reason: 'Registered address is shared with five other companies (shell cluster).',
      latencyMs: 2100,
    }),
    chk({
      id: 'shell_recent',
      pillar: 'ownership',
      label: 'Incorporation age / footprint',
      status: 'flag',
      severity: 'medium',
      points: 3,
      value: 'Incorporated 4 months ago',
      source: 'MCA',
      reason: 'Recently incorporated with no filings and a thin footprint.',
      latencyMs: 1700,
    }),
    chk({
      id: 'adverse_media',
      pillar: 'screening',
      label: 'Adverse media — Rakesh Kumar',
      status: 'flag',
      severity: 'high',
      points: 7,
      value: 'Hits found',
      source: 'AML',
      personId: 'p_rakesh',
      reason: 'Adverse-media hits tying the signatory to struck-off entities.',
      latencyMs: 2000,
    }),
  ],
  graph: vertexGraph,
  stage: 'declined',
  submittedAt: `${TODAY}T07:55:00+05:30`,
  assignedOfficer: 'iyer',
  audit: [],
  demoNote: 'Looks fine on paper — the network graph reveals the shell cluster + mule. Hard-stop, decline.',
}

/* ============================================================
   4. MAA DURGA ENTERPRISES — Partnership — THE MORE-INFO CASE
   ============================================================ */

const vikram: Person = {
  id: 'p_vikram',
  name: 'Vikram Shah',
  roles: ['partner', 'signatory'],
  pan: 'AEYPS2218Q',
  ownership: 0.6,
  isSignatory: true,
  identityPath: 'biometric',
  kyc: 'pass',
  nationality: 'IN',
}
const pooja: Person = {
  id: 'p_pooja',
  name: 'Pooja Shah',
  roles: ['partner'],
  pan: 'AEYPS9934R',
  ownership: 0.4,
  identityPath: 'biometric',
  kyc: 'flag',
  nationality: 'IN',
  screening: [
    { kind: 'sanctions', match: 'false_positive', detail: 'Name resembles a listed individual; DOB and nationality differ.', source: 'Sanctions list' },
  ],
}

const maaDurgaApp: Application = {
  id: 'app_maadurga',
  anchor: '27AAEFM5566G1Z9',
  legalName: 'Maa Durga Enterprises',
  tradeName: 'Maa Durga Enterprises',
  entityType: 'partnership',
  tier: 'full',
  channel: 'agent',
  declaredTurnover: 55_00_000,
  exposure: 35_00_000,
  bankShare: 0.7,
  entityPan: 'AAEFM5566G',
  gstin: '27AAEFM5566G1Z9',
  registeredAddress: '112, Lamington Road, Mumbai 400007',
  state: 'Maharashtra',
  people: [vikram, pooja],
  beneficialOwners: [
    { personId: 'p_vikram', effectiveOwnership: 0.6 },
    { personId: 'p_pooja', effectiveOwnership: 0.4 },
  ],
  documents: [
    { id: 'd_deed', label: 'Partnership deed', status: 'received', quality: ['original', 'legible'] },
    { id: 'd_pan', label: 'Firm PAN', status: 'received', fields: [{ label: 'PAN', extracted: 'AAEFM5566G', match: 'match' }] },
    { id: 'd_gst', label: 'GST certificate', status: 'received', fields: [{ label: 'Status', extracted: 'Suspended', match: 'mismatch' }] },
  ],
  checks: [
    chk({ pillar: 'identity', label: 'PAN validation — Vikram Shah', status: 'pass', severity: 'info', value: 'AEYPS2218Q', source: 'NSDL', personId: 'p_vikram', latencyMs: 1000 }),
    chk({ pillar: 'identity', label: 'Biometric e-KYC — both partners', status: 'pass', severity: 'info', value: 'Verified', source: 'UIDAI', latencyMs: 1500 }),
    chk({
      id: 'gst_suspended',
      pillar: 'business',
      label: 'GSTIN status',
      status: 'flag',
      severity: 'high',
      value: 'Suspended',
      source: 'GSTN',
      reason: 'GSTIN appears suspended — current registration needed.',
      latencyMs: 1700,
    }),
    chk({ pillar: 'business', label: 'Name match across sources', status: 'pass', severity: 'info', value: 'Maa Durga Enterprises', source: 'Internal', latencyMs: 1100 }),
    chk({
      id: 'pennydrop_name_mismatch',
      pillar: 'financial',
      label: 'Penny-drop name match',
      status: 'flag',
      severity: 'medium',
      value: '"Maa Durga Enterprise" vs "…Enterprises"',
      source: 'Penny-drop',
      reason: 'Bank account name differs from the firm name (singular vs plural).',
      latencyMs: 1600,
    }),
    chk({ pillar: 'premises', label: 'Address match vs OVD', status: 'pass', severity: 'info', value: 'Match', source: 'CPV', latencyMs: 1300 }),
    chk({ pillar: 'ownership', label: 'Beneficial owners (>10%)', status: 'pass', severity: 'info', value: 'Vikram 60% · Pooja 40%', source: 'Internal', latencyMs: 1000 }),
    chk({
      id: 'sanctions_false_positive',
      pillar: 'screening',
      label: 'Sanctions screening — Pooja Shah',
      status: 'flag',
      severity: 'low',
      value: 'Potential match (common name)',
      source: 'AML',
      personId: 'p_pooja',
      reason: 'Possible sanctions match on a common name — likely false positive, needs disambiguation.',
      latencyMs: 1900,
    }),
  ],
  graph: {
    nodes: [
      { id: 'e_maadurga', kind: 'entity', label: 'Maa Durga Enterprises', sublabel: 'Partnership' },
      { id: 'p_vikram', kind: 'person', label: 'Vikram Shah', sublabel: 'Partner · 60%' },
      { id: 'p_pooja', kind: 'person', label: 'Pooja Shah', sublabel: 'Partner · 40%' },
    ],
    edges: [
      { id: 'g1', source: 'p_vikram', target: 'e_maadurga', label: 'partner · 60%' },
      { id: 'g2', source: 'p_pooja', target: 'e_maadurga', label: 'partner · 40%' },
    ],
  },
  stage: 'more_info',
  submittedAt: `${TODAY}T10:05:00+05:30`,
  assignedOfficer: 'iyer',
  audit: [],
  demoNote: 'Suspended GST + penny-drop name mismatch → actionable "more info needed"; false-positive sanctions to clear.',
}

/* ============================================================
   5. QUICKCART RETAIL PVT LTD — Private Limited — MONITORING
   ============================================================ */

const quickcartApp: Application = {
  id: 'app_quickcart',
  anchor: 'U52100KA2023PTC098765',
  legalName: 'QuickCart Retail Pvt Ltd',
  tradeName: 'QuickCart',
  entityType: 'pvt_ltd',
  tier: 'full',
  channel: 'self_serve',
  declaredTurnover: 1_80_00_000,
  exposure: 90_00_000,
  bankShare: 0.6,
  entityPan: 'AALCQ4567P',
  gstin: '29AALCQ4567P1Z0',
  cin: 'U52100KA2023PTC098765',
  registeredAddress: '5th Floor, Brigade Gateway, Bengaluru 560055',
  state: 'Karnataka',
  people: [
    { id: 'p_qc1', name: 'Neha Kulkarni', roles: ['director', 'signatory'], pan: 'AFZPK2231D', din: '09556677', ownership: 0.55, isSignatory: true, identityPath: 'vcip', kyc: 'pass', nationality: 'IN' },
    { id: 'p_qc2', name: 'Rohan Pillai', roles: ['director'], pan: 'AGLPP8890F', din: '09556688', ownership: 0.45, identityPath: 'vcip', kyc: 'pass', nationality: 'IN' },
  ],
  beneficialOwners: [
    { personId: 'p_qc1', effectiveOwnership: 0.55 },
    { personId: 'p_qc2', effectiveOwnership: 0.45 },
  ],
  documents: [],
  checks: [
    chk({ pillar: 'identity', label: 'V-CIP — both directors', status: 'pass', severity: 'info', value: 'Verified', source: 'UIDAI', latencyMs: 1400 }),
    chk({ pillar: 'business', label: 'MCA company status', status: 'pass', severity: 'info', value: 'Active', source: 'MCA', latencyMs: 1500 }),
    chk({ pillar: 'business', label: 'GSTIN status', status: 'pass', severity: 'info', value: 'Active · returns filed', source: 'GSTN', latencyMs: 1300 }),
    chk({ pillar: 'financial', label: 'Penny-drop name match', status: 'pass', severity: 'info', value: 'Match', source: 'Penny-drop', latencyMs: 1400 }),
    chk({ pillar: 'premises', label: 'CPV (geo-photo)', status: 'pass', severity: 'info', value: 'Match', source: 'CPV', latencyMs: 1200 }),
    chk({ pillar: 'ownership', label: 'Beneficial owners (>10%)', status: 'pass', severity: 'info', value: 'Neha 55% · Rohan 45%', source: 'Internal', latencyMs: 1000 }),
    chk({ pillar: 'screening', label: 'AML / sanctions / PEP', status: 'pass', severity: 'info', value: 'Clear', source: 'AML', latencyMs: 1500 }),
  ],
  graph: {
    nodes: [
      { id: 'e_qc', kind: 'entity', label: 'QuickCart Retail Pvt Ltd', sublabel: 'Private Limited' },
      { id: 'p_qc1', kind: 'person', label: 'Neha Kulkarni', sublabel: 'Director · 55%' },
      { id: 'p_qc2', kind: 'person', label: 'Rohan Pillai', sublabel: 'Director · 45%' },
    ],
    edges: [
      { id: 'g1', source: 'p_qc1', target: 'e_qc', label: 'director · 55%' },
      { id: 'g2', source: 'p_qc2', target: 'e_qc', label: 'director · 45%' },
    ],
  },
  account: { number: '50100118872231', ifsc: 'HDFC0001289', type: 'full_current' },
  deployments: [
    { kind: 'qr', id: 'QR-29KA0098765', label: 'Static QR' },
    { kind: 'pos', id: 'POS-TID-44219', label: 'POS terminal' },
  ],
  stage: 'monitoring',
  submittedAt: '2026-05-21T11:30:00+05:30',
  assignedOfficer: 'iyer',
  audit: [],
  demoNote: 'Live merchant. A QR volume spike feeds account risk Low→Medium — continuous, unified monitoring.',
}

/* ============================================================
   6. ANAND KIRANA STORE — Proprietorship — EDGE-CASE SAMPLER
   ============================================================ */

const anand: Person = {
  id: 'p_anand',
  name: 'Anand Kumar',
  roles: ['proprietor', 'signatory'],
  pan: 'CXKPA7788N',
  ownership: 1,
  isSignatory: true,
  identityPath: 'otp_ekyc',
  kyc: 'flag',
  nationality: 'IN',
  notes: ['PAN–Aadhaar link pending', 'OTP e-KYC → enhanced due diligence + limited account'],
}

const anandApp: Application = {
  id: 'app_anand',
  anchor: 'CXKPA7788N',
  legalName: 'Anand Kumar',
  tradeName: 'Anand Kirana Store',
  entityType: 'proprietorship',
  tier: 'simplified',
  channel: 'agent',
  declaredTurnover: 25_00_000,
  exposure: 25_00_000,
  bankShare: 1,
  entityPan: 'CXKPA7788N',
  udyam: 'UDYAM-KA-03-0091234',
  registeredAddress: '3, Gandhi Bazaar, Basavanagudi, Bengaluru 560004',
  state: 'Karnataka',
  people: [anand],
  beneficialOwners: [{ personId: 'p_anand', effectiveOwnership: 1 }],
  documents: [
    { id: 'd_pan', label: 'PAN card', status: 'received', quality: ['original', 'legible'] },
    { id: 'd_udyam', label: 'Udyam registration', status: 'received' },
    { id: 'd_shop', label: 'Shop & Establishment certificate', status: 'received' },
    { id: 'd_util', label: 'Utility bill', status: 'received' },
  ],
  checks: [
    chk({ pillar: 'identity', label: 'PAN validation', status: 'pass', severity: 'info', value: 'CXKPA7788N', source: 'NSDL', personId: 'p_anand', latencyMs: 900 }),
    chk({ pillar: 'identity', label: 'OTP e-KYC', status: 'pass', severity: 'info', value: 'Verified (OTP) · EDD + limited account', source: 'UIDAI', personId: 'p_anand', latencyMs: 1300 }),
    chk({
      id: 'pan_aadhaar_link',
      pillar: 'identity',
      label: 'PAN–Aadhaar link',
      status: 'flag',
      severity: 'low',
      value: 'Pending',
      source: 'NSDL',
      personId: 'p_anand',
      reason: 'PAN–Aadhaar not yet linked — account proceeds as limited until resolved.',
      latencyMs: 1200,
    }),
    chk({
      id: 'not_gst_registered',
      pillar: 'business',
      label: 'GST registration',
      status: 'pass',
      severity: 'info',
      value: 'Not registered (below threshold) · Udyam relied on',
      source: 'GSTN',
      latencyMs: 1100,
    }),
    chk({ pillar: 'business', label: 'Udyam registration', status: 'pass', severity: 'info', value: 'UDYAM-KA-03-0091234', source: 'Internal', latencyMs: 1000 }),
    chk({
      id: 'otp_edd',
      pillar: 'identity',
      label: 'Non-face-to-face onboarding',
      status: 'flag',
      severity: 'info',
      value: 'OTP path → EDD',
      source: 'Internal',
      personId: 'p_anand',
      reason: 'OTP e-KYC implies enhanced due diligence and tighter initial limits.',
      latencyMs: 800,
    }),
    chk({ pillar: 'financial', label: 'Penny-drop name match', status: 'pass', severity: 'info', value: 'Match', source: 'Penny-drop', latencyMs: 1400 }),
    chk({ pillar: 'premises', label: 'CPV (geo-photo)', status: 'pass', severity: 'info', value: 'Match', source: 'CPV', latencyMs: 1300 }),
    chk({ pillar: 'screening', label: 'AML / sanctions / PEP', status: 'pass', severity: 'info', value: 'Clear', source: 'AML', latencyMs: 1500 }),
  ],
  graph: {
    nodes: [
      { id: 'e_anand', kind: 'entity', label: 'Anand Kirana Store', sublabel: 'Proprietorship' },
      { id: 'p_anand', kind: 'person', label: 'Anand Kumar', sublabel: 'Proprietor · 100%' },
    ],
    edges: [{ id: 'g1', source: 'p_anand', target: 'e_anand', label: 'owns 100%' }],
  },
  stage: 'lead',
  submittedAt: `${TODAY}T11:20:00+05:30`,
  audit: [],
  demoNote: 'Thin-file, not GST-registered (legitimately) → not punished; OTP path shows EDD + limited-account consequences.',
}

/* ---------------- exports ---------------- */

export const APPLICATIONS: Application[] = [
  saanviApp,
  greenleafApp,
  vertexApp,
  maaDurgaApp,
  quickcartApp,
  anandApp,
]

export const APPLICATIONS_BY_ID: Record<string, Application> = Object.fromEntries(
  APPLICATIONS.map((a) => [a.id, a]),
)

/** Live monitoring portfolio (QuickCart carries the mule-pattern alert). */
export const MONITORED: MonitoredMerchant[] = [
  {
    applicationId: 'app_quickcart',
    legalName: 'QuickCart Retail Pvt Ltd',
    liveBand: 'medium',
    startBand: 'low',
    trend: [
      { t: 'W-5', volume: 42 },
      { t: 'W-4', volume: 48 },
      { t: 'W-3', volume: 51 },
      { t: 'W-2', volume: 55 },
      { t: 'W-1', volume: 61 },
      { t: 'This wk', volume: 168 },
    ],
    alert: {
      title: 'QR volume spike — mule pattern',
      detail:
        'Transaction volume rose ~3× week-on-week with a fan-in pattern inconsistent with declared retail activity. Acquiring signal feeds the account risk view.',
      severity: 'high',
    },
    reKycDue: '2026-07-15',
  },
  {
    applicationId: 'app_saanvi',
    legalName: 'Saanvi Textiles',
    liveBand: 'low',
    startBand: 'low',
    trend: [
      { t: 'W-5', volume: 12 },
      { t: 'W-4', volume: 14 },
      { t: 'W-3', volume: 13 },
      { t: 'W-2', volume: 15 },
      { t: 'W-1', volume: 16 },
      { t: 'This wk', volume: 15 },
    ],
    reKycDue: '2027-06-18',
  },
]

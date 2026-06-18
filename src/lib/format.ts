/**
 * Indian-format helpers. All money and IDs render in Geist Mono with tabular
 * numerals (see the `.tnum` utility / IdChip / amount components).
 */

/** Indian digit grouping (lakh/crore): 1,20,00,000. Accepts rupees. */
export function formatINR(rupees: number, opts: { paise?: boolean } = {}): string {
  const negative = rupees < 0
  const abs = Math.abs(rupees)
  const [whole, frac] = abs.toFixed(opts.paise ? 2 : 0).split('.')
  // Group: last 3 digits, then pairs.
  const last3 = whole.slice(-3)
  const rest = whole.slice(0, -3)
  const grouped = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
    : last3
  const body = frac ? `${grouped}.${frac}` : grouped
  return `${negative ? '-' : ''}₹${body}`
}

/** Compact Indian scale for dense UI: ₹2.4 Cr, ₹38 L, ₹45,000. */
export function formatINRCompact(rupees: number): string {
  const abs = Math.abs(rupees)
  const sign = rupees < 0 ? '-' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)} Cr`
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)} L`
  return formatINR(rupees)
}

function trim(n: number): string {
  return Number(n.toFixed(2)).toString()
}

/** Mask an account number, showing the last 4: ••••••4471. */
export function maskAccount(acct: string, visible = 4): string {
  const clean = acct.replace(/\s+/g, '')
  if (clean.length <= visible) return clean
  return '•'.repeat(Math.max(6, clean.length - visible)) + clean.slice(-visible)
}

/** Format a percentage from a 0..1 fraction or a whole number. */
export function formatPct(value: number, { fraction = false } = {}): string {
  const pct = fraction ? value * 100 : value
  return `${Number(pct.toFixed(pct % 1 === 0 ? 0 : 1))}%`
}

/* ---- ID display formatters (spacing only; never alter the value) ---- */

/** PAN: ABKPS 4321 F — grouped for readability. */
export function formatPAN(pan: string): string {
  const v = pan.toUpperCase().replace(/\s+/g, '')
  if (v.length !== 10) return v
  return `${v.slice(0, 5)} ${v.slice(5, 9)} ${v.slice(9)}`
}

/** GSTIN: 29 ABKPS4321F 1 Z 8. */
export function formatGSTIN(gstin: string): string {
  const v = gstin.toUpperCase().replace(/\s+/g, '')
  if (v.length !== 15) return v
  return `${v.slice(0, 2)} ${v.slice(2, 12)} ${v.slice(12, 13)} ${v.slice(13, 14)} ${v.slice(14)}`
}

/** State code (first 2 of GSTIN) → state name. */
const GST_STATE: Record<string, string> = {
  '07': 'Delhi',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
}
export function gstinState(gstin: string): string | undefined {
  return GST_STATE[gstin.slice(0, 2)]
}

/** CIN stays as-is (21 chars), uppercased. */
export function formatCIN(cin: string): string {
  return cin.toUpperCase().replace(/\s+/g, '')
}

/** Udyam / LLPIN / DIN / IFSC: uppercased, trimmed — canonical forms already grouped. */
export function formatId(value: string): string {
  return value.toUpperCase().trim()
}

const D = (s: string) => s.replace(/[^0-9]/g, '')

/** dd Mon yyyy from an ISO date (YYYY-MM-DD) or a Date. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function formatDate(iso: string): string {
  const m = D(iso)
  if (iso.includes('-') && m.length >= 8) {
    const [y, mo, d] = iso.split('-')
    return `${d} ${MONTHS[Number(mo) - 1]} ${y}`
  }
  return iso
}

/** Relative age in days/hours for queue rows ("3d", "5h", "just now"). */
export function ago(fromISO: string, nowISO: string): string {
  const from = new Date(fromISO).getTime()
  const now = new Date(nowISO).getTime()
  const mins = Math.max(0, Math.round((now - from) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.round(hrs / 24)}d`
}

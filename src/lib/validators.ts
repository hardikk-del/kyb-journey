/**
 * Format validators for Indian identifiers. Shape-only (these are demo
 * fixtures, not live registry calls); each returns a typed result so Field can
 * show inline helper/error text.
 */

export interface ValidationResult {
  ok: boolean
  message?: string
}

const ok: ValidationResult = { ok: true }

/** PAN: 5 letters + 4 digits + 1 letter; 4th letter encodes holder type. */
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
export type PanHolder = 'individual' | 'company' | 'firm' | 'huf' | 'trust' | 'unknown'
const PAN_HOLDER: Record<string, PanHolder> = {
  P: 'individual',
  C: 'company',
  F: 'firm',
  H: 'huf',
  T: 'trust',
}
export function validatePAN(v: string): ValidationResult {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!s) return ok
  if (!PAN_RE.test(s)) return { ok: false, message: 'PAN must be 5 letters, 4 digits, then a letter.' }
  return ok
}
export function panHolderType(v: string): PanHolder {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!PAN_RE.test(s)) return 'unknown'
  return PAN_HOLDER[s[3]] ?? 'unknown'
}

/** GSTIN: 2-digit state + 10-char PAN + entity digit + Z + checksum char. */
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/
export function validateGSTIN(v: string): ValidationResult {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!s) return ok
  if (s.length !== 15 || !GSTIN_RE.test(s)) return { ok: false, message: 'GSTIN must be 15 characters in the standard format.' }
  return ok
}

/** CIN: 21 chars, e.g. U51909KA2021PTC145678. */
const CIN_RE = /^[LUu][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/
export function validateCIN(v: string): ValidationResult {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!s) return ok
  if (!CIN_RE.test(s)) return { ok: false, message: 'CIN must be 21 characters in the standard MCA format.' }
  return ok
}

/** LLPIN: e.g. AAF-7421. */
const LLPIN_RE = /^[A-Z]{3}-?[0-9]{4}$/
export function validateLLPIN(v: string): ValidationResult {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!s) return ok
  return LLPIN_RE.test(s) ? ok : { ok: false, message: 'LLPIN looks like AAF-7421.' }
}

/** Udyam: UDYAM-KA-03-0456712. */
const UDYAM_RE = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/
export function validateUdyam(v: string): ValidationResult {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!s) return ok
  return UDYAM_RE.test(s) ? ok : { ok: false, message: 'Udyam looks like UDYAM-KA-03-0456712.' }
}

/** DIN/DPIN: 8 digits. */
const DIN_RE = /^[0-9]{8}$/
export function validateDIN(v: string): ValidationResult {
  const s = v.replace(/\s+/g, '')
  if (!s) return ok
  return DIN_RE.test(s) ? ok : { ok: false, message: 'DIN/DPIN is 8 digits.' }
}

/** IFSC: 4 letters + 0 + 6 alphanumerics, e.g. HDFC0001289. */
const IFSC_RE = /^[A-Z]{4}0[0-9A-Z]{6}$/
export function validateIFSC(v: string): ValidationResult {
  const s = v.toUpperCase().replace(/\s+/g, '')
  if (!s) return ok
  return IFSC_RE.test(s) ? ok : { ok: false, message: 'IFSC is 4 letters, a 0, then 6 characters.' }
}

/** Indian mobile: optional +91, then a 10-digit number starting 6–9. */
const MOBILE_RE = /^(\+?91[- ]?)?[6-9][0-9]{9}$/
export function validateMobile(v: string): ValidationResult {
  const s = v.replace(/\s+/g, '')
  if (!s) return ok
  return MOBILE_RE.test(s) ? ok : { ok: false, message: 'Enter a 10-digit Indian mobile number.' }
}

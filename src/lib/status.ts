/**
 * Central status → label/tone map. Tone names map to the restricted risk
 * palette (ok/warn/risk/brand/neutral) defined in tokens.css. Components read
 * tone here; they never inline a hex or pick a color ad hoc.
 */

export type Tone = 'ok' | 'warn' | 'risk' | 'info' | 'neutral'

/** Per-check lifecycle state (a small state machine: pending → pass|flag|fail|error). */
export type CheckStatus = 'pending' | 'pass' | 'flag' | 'fail' | 'error'

/** Roll-up risk band. */
export type RiskBand = 'low' | 'medium' | 'high'

export interface ToneClasses {
  /** filled chip / pill background + text */
  pill: string
  /** soft surface used for callout cards */
  surface: string
  /** the status dot */
  dot: string
  /** solid text color */
  text: string
  /** solid background (gauges, fills) */
  solid: string
}

const TONE: Record<Tone, ToneClasses> = {
  ok: {
    pill: 'bg-ok-bg text-ok',
    surface: 'bg-ok-bg border-ok/20',
    dot: 'bg-ok',
    text: 'text-ok',
    solid: 'bg-ok',
  },
  warn: {
    pill: 'bg-warn-bg text-warn',
    surface: 'bg-warn-bg border-warn/20',
    dot: 'bg-warn',
    text: 'text-warn',
    solid: 'bg-warn',
  },
  risk: {
    pill: 'bg-risk-bg text-risk',
    surface: 'bg-risk-bg border-risk/20',
    dot: 'bg-risk',
    text: 'text-risk',
    solid: 'bg-risk',
  },
  info: {
    pill: 'bg-brand-50 text-brand-600',
    surface: 'bg-brand-50 border-brand-600/15',
    dot: 'bg-brand-600',
    text: 'text-brand-600',
    solid: 'bg-brand-600',
  },
  neutral: {
    pill: 'bg-sunken text-ink-2',
    surface: 'bg-sunken border-line',
    dot: 'bg-ink-3',
    text: 'text-ink-2',
    solid: 'bg-ink-3',
  },
}

export function toneClasses(tone: Tone): ToneClasses {
  return TONE[tone]
}

const CHECK_STATUS: Record<CheckStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Verifying', tone: 'info' },
  pass: { label: 'Pass', tone: 'ok' },
  flag: { label: 'Flag', tone: 'warn' },
  fail: { label: 'Fail', tone: 'risk' },
  error: { label: "Didn't respond", tone: 'neutral' },
}

export function checkStatusMeta(status: CheckStatus): { label: string; tone: Tone } {
  return CHECK_STATUS[status]
}

const RISK_BAND: Record<RiskBand, { label: string; tone: Tone }> = {
  low: { label: 'Low', tone: 'ok' },
  medium: { label: 'Medium', tone: 'warn' },
  high: { label: 'High', tone: 'risk' },
}

export function riskBandMeta(band: RiskBand): { label: string; tone: Tone } {
  return RISK_BAND[band]
}

/** Score → band using config thresholds (lowMax/mediumMax). */
export function bandForScore(score: number, lowMax: number, mediumMax: number): RiskBand {
  if (score <= lowMax) return 'low'
  if (score <= mediumMax) return 'medium'
  return 'high'
}

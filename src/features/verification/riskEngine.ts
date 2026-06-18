/**
 * The risk engine. Pure and config-driven: given a set of checks and a
 * RiskConfig it returns the composite score, band, per-pillar sub-scores,
 * reason codes and hard-stops. The Verify screen calls this repeatedly as
 * checks resolve, so it must handle pending (provisional) checks.
 */
import { bandForScore, type RiskBand } from '@/lib/status'
import {
  PILLARS,
  PILLAR_LABEL,
  type Check,
  type Outcome,
  type Pillar,
  type PillarScore,
  type ReasonCode,
  type RiskResult,
} from '@/data/types'
import { SEVERITY_POINTS, type RiskConfig } from '@/data/config'

const PILLAR_COUNT = PILLARS.length

/** Risk points a single check contributes (0 unless it's a terminal flag/fail). */
export function checkPoints(check: Check): number {
  if (check.status !== 'flag' && check.status !== 'fail') return 0
  if (typeof check.points === 'number') return check.points
  return SEVERITY_POINTS[check.status][check.severity] ?? 0
}

/** Weight multiplier so equal weights are neutral (≈1) and a heavier pillar
 *  amplifies its checks. Editing weights in Admin therefore moves the score. */
function pillarMultiplier(pillar: Pillar, config: RiskConfig): number {
  return config.riskWeights[pillar] * PILLAR_COUNT
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n))
}

export function scoreApplication(checks: Check[], config: RiskConfig): RiskResult {
  const provisional = checks.some((c) => c.status === 'pending')

  // Per-pillar display sub-scores (unweighted accumulation off the baseline).
  const pillars: PillarScore[] = PILLARS.map((pillar) => {
    const points = checks
      .filter((c) => c.pillar === pillar)
      .reduce((sum, c) => sum + checkPoints(c), 0)
    return {
      pillar,
      score: clamp(config.baseline + points),
      weight: config.riskWeights[pillar],
    }
  })

  // Composite: baseline + weight-scaled accumulation across all checks.
  const accumulated = checks.reduce(
    (sum, c) => sum + checkPoints(c) * pillarMultiplier(c.pillar, config),
    0,
  )
  let score = clamp(Math.round(config.baseline + accumulated))

  // Reason codes from every non-pass terminal check.
  const reasonCodes: ReasonCode[] = checks
    .filter((c) => c.status === 'flag' || c.status === 'fail' || c.status === 'error')
    .map((c) => ({
      code: c.id,
      label: c.reason ?? c.label,
      pillar: c.pillar,
      severity: c.severity,
    }))

  // Hard-stops: a terminal flag/fail forces High when the check is marked
  // hardStop or its id is in the config's (Admin-editable) hard-stop list.
  const hardStops: ReasonCode[] = checks
    .filter(
      (c) =>
        (c.hardStop || config.hardStops.includes(c.id)) &&
        (c.status === 'fail' || c.status === 'flag'),
    )
    .map((c) => ({
      code: c.id,
      label: c.reason ?? c.label,
      pillar: c.pillar,
      severity: c.severity,
    }))

  let band: RiskBand
  if (hardStops.length > 0) {
    band = 'high'
    score = Math.max(score, config.hardStopFloor)
  } else {
    band = bandForScore(score, config.bands.lowMax, config.bands.mediumMax)
  }

  const outcome: Outcome =
    band === 'high' ? 'declined' : band === 'medium' ? 'review' : 'approved'

  return { score, band, pillars, reasonCodes, hardStops, provisional, outcome }
}

/** Sort reason codes most-severe first for display. */
const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
}
export function sortReasonCodes(codes: ReasonCode[]): ReasonCode[] {
  return [...codes].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

export { PILLAR_LABEL }

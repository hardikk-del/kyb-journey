import type { Pillar } from './types'

/**
 * Risk & policy configuration. Everything the engine and the gates read lives
 * here; the Admin screen edits a copy of this and re-scores cases live
 * (see 05_MOCK_DATA.md). Numbers are policy, never hardcoded in the engine.
 */
export interface RiskConfig {
  /** Pillar weights — must sum to 1. Heaviest on ownership/network (the fraud lens). */
  riskWeights: Record<Pillar, number>
  /** Composite band thresholds. */
  bands: { lowMax: number; mediumMax: number }
  /** Turnover at/above which full CDD applies (₹40 lakh). */
  tierTurnoverThreshold: number
  /** Current-account exposure gate. */
  exposure: { freeBelow: number; minShareAtOrAbove: number }
  /** Beneficial-owner threshold as a 0..1 fraction (>10% per PMLA default). */
  beneficialOwnerThreshold: number
  /** Reason codes that force the High band regardless of score. */
  hardStops: string[]
  /** Composite floor applied when a hard-stop fires. */
  hardStopFloor: number
  /** Residual baseline composite for an otherwise-clean case. */
  baseline: number
  /** Approvals at/above this composite need maker-checker sign-off. */
  makerCheckerAbove: number
}

export const defaultConfig: RiskConfig = {
  riskWeights: {
    identity: 0.15,
    business: 0.2,
    financial: 0.15,
    premises: 0.1,
    ownership: 0.25,
    screening: 0.15,
  },
  bands: { lowMax: 30, mediumMax: 70 },
  tierTurnoverThreshold: 40_00_000, // ₹40 lakh
  exposure: { freeBelow: 10_00_00_000, minShareAtOrAbove: 0.1 }, // ₹10 crore / 10%
  beneficialOwnerThreshold: 0.1,
  hardStops: ['sanctions_true_match', 'struck_off_link', 'confirmed_mule'],
  hardStopFloor: 82,
  baseline: 12,
  makerCheckerAbove: 40,
}

/**
 * Risk points contributed by a check, by (status, severity). Pass/pending/error
 * contribute nothing. This is an additive scorecard (a standard bank pattern):
 * points accumulate, scaled by the pillar's relative weight, into the composite.
 */
export const SEVERITY_POINTS: Record<'flag' | 'fail', Record<string, number>> = {
  flag: { info: 4, low: 8, medium: 14, high: 28, critical: 34 },
  fail: { info: 8, low: 14, medium: 26, high: 36, critical: 46 },
}

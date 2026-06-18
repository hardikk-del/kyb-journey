/**
 * Account-opening exposure gate and tier classification. Both read the same
 * RiskConfig the Admin screen edits, so policy changes flow through live.
 */
import type { RiskConfig } from '@/data/config'
import type { BankAccount, Tier } from '@/data/types'

/** Auto-classify the DD tier from declared turnover. */
export function classifyTier(declaredTurnover: number, config: RiskConfig): Tier {
  return declaredTurnover < config.tierTurnoverThreshold ? 'simplified' : 'full'
}

export interface GateResult {
  /** The account type the bank can open under the gate. */
  accountType: BankAccount['type']
  /** Whether a full current account is permitted. */
  fullCurrentAllowed: boolean
  /** Plain-language reasoning for the decision. */
  reason: string
}

/**
 * Exposure gate: below the free threshold there's no restriction; at/above it
 * the bank needs at least the configured share, else collection-account-only.
 */
export function evaluateGate(
  exposure: number,
  bankShare: number | undefined,
  config: RiskConfig,
): GateResult {
  const { freeBelow, minShareAtOrAbove } = config.exposure
  if (exposure < freeBelow) {
    return {
      accountType: 'full_current',
      fullCurrentAllowed: true,
      reason: 'Aggregate exposure is below the gate threshold — full current account permitted.',
    }
  }
  const share = bankShare ?? 0
  if (share >= minShareAtOrAbove) {
    return {
      accountType: 'full_current',
      fullCurrentAllowed: true,
      reason: `Exposure is at/above the threshold but the bank holds ≥${Math.round(
        minShareAtOrAbove * 100,
      )}% share — full current account permitted.`,
    }
  }
  return {
    accountType: 'collection_only',
    fullCurrentAllowed: false,
    reason: `Exposure is at/above the threshold and the bank holds under ${Math.round(
      minShareAtOrAbove * 100,
    )}% share — collection account only.`,
  }
}

/**
 * Simulated parallel verification. The Verify screen starts every check as
 * `pending` and this service resolves each to its authored terminal status
 * after a deterministic delay, calling back as they land — powering the
 * risk-score assembly (signature moment #1). Instant mode resolves immediately.
 */
import { isInstantMode } from '@/lib/sleep'
import type { Check } from '@/data/types'

export interface VerificationHandle {
  /** Resolves with the fully-resolved checks once all have landed. */
  done: Promise<Check[]>
  /** Cancel any pending resolutions (e.g. on unmount or "skip"). */
  cancel: () => void
}

export interface RunOptions {
  /** Called as each check resolves, in resolution order. */
  onResolve?: (check: Check, resolvedCount: number, total: number) => void
  /** Stamp resolved checks with this ISO timestamp (deterministic for demos). */
  ts?: string
}

/** Return a fresh copy of the checks all set to `pending` (the screen's
 *  starting state). */
export function pendingCopy(checks: Check[]): Check[] {
  return checks.map((c) => ({ ...c, status: 'pending' as const, ts: undefined }))
}

export function runVerification(checks: Check[], opts: RunOptions = {}): VerificationHandle {
  const timers: ReturnType<typeof setTimeout>[] = []
  const total = checks.length
  let resolvedCount = 0

  const done = new Promise<Check[]>((resolve) => {
    const resolved: Check[] = []
    // Resolve in ascending latency order so the UI fills bottom-up naturally.
    const ordered = [...checks].sort((a, b) => (a.latencyMs ?? 0) - (b.latencyMs ?? 0))

    ordered.forEach((check) => {
      const delay = isInstantMode() ? 0 : (check.latencyMs ?? 1200)
      const timer = setTimeout(() => {
        const landed: Check = { ...check, ts: opts.ts }
        resolved.push(landed)
        resolvedCount += 1
        opts.onResolve?.(landed, resolvedCount, total)
        if (resolvedCount === total) resolve(resolved)
      }, delay)
      timers.push(timer)
    })

    if (total === 0) resolve([])
  })

  return { done, cancel: () => timers.forEach(clearTimeout) }
}

/** Demo latency. Instant mode (for rehearsal) collapses all waits to ~0. */
let instant = false

export function setInstantMode(on: boolean): void {
  instant = on
}

export function isInstantMode(): boolean {
  return instant
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, instant ? 0 : ms))
}

/**
 * Deterministic latency in [min, max] derived from a seed (e.g. a fixture id +
 * check id), so a given demo always resolves checks in the same order.
 */
export function seededLatency(seed: string, min = 800, max = 2500): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const unit = ((h >>> 0) % 1000) / 1000
  return Math.round(min + unit * (max - min))
}

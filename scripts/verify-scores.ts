/**
 * Dev assertion: confirm the engine reproduces the scripted scores from
 * 05_MOCK_DATA.md. Run with: node --experimental-strip-types scripts/verify-scores.ts
 * (kept out of the app bundle).
 */
import { scoreApplication } from '../src/features/verification/riskEngine.ts'
import { defaultConfig } from '../src/data/config.ts'
import { APPLICATIONS } from '../src/data/fixtures.ts'

const EXPECT: Record<string, { band: string; near?: number }> = {
  app_saanvi: { band: 'low', near: 12 },
  app_greenleaf: { band: 'medium', near: 46 },
  app_vertex: { band: 'high', near: 88 },
  app_maadurga: { band: 'medium', near: 65 },
  app_quickcart: { band: 'low', near: 12 },
  app_anand: { band: 'low', near: 23 },
}

let failures = 0
for (const app of APPLICATIONS) {
  const r = scoreApplication(app.checks, defaultConfig)
  const exp = EXPECT[app.id]
  const bandOk = !exp || r.band === exp.band
  const nearOk = !exp?.near || Math.abs(r.score - exp.near) <= 6
  const ok = bandOk && nearOk
  if (!ok) failures++
  console.log(
    `${ok ? 'OK ' : 'XX '} ${app.legalName.padEnd(28)} score=${String(r.score).padStart(3)} band=${r.band.padEnd(6)} hardStops=${r.hardStops.length} reasons=${r.reasonCodes.length}` +
      (exp ? `  (expect band=${exp.band}, ~${exp.near})` : ''),
  )
}
console.log(failures === 0 ? '\nAll scores match expectations.' : `\n${failures} mismatch(es).`)
process.exit(failures === 0 ? 0 : 1)

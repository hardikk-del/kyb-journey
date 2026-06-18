/**
 * Live risk/policy config. The Admin screen mutates this store; the Verify
 * screen and Case Detail read it through the engine, so editing a weight and
 * reopening a case changes its score (a demo proof-point). `reset` restores the
 * shipped defaults for "reset demo".
 */
import { create } from 'zustand'
import { defaultConfig, type RiskConfig } from '@/data/config'

interface ConfigStore {
  config: RiskConfig
  setWeights: (weights: Partial<RiskConfig['riskWeights']>) => void
  setConfig: (patch: Partial<RiskConfig>) => void
  reset: () => void
}

// Deep-clone so mutations never touch the shipped defaults.
const clone = (c: RiskConfig): RiskConfig => ({
  ...c,
  riskWeights: { ...c.riskWeights },
  bands: { ...c.bands },
  exposure: { ...c.exposure },
  hardStops: [...c.hardStops],
})

export const useConfig = create<ConfigStore>((set) => ({
  config: clone(defaultConfig),
  setWeights: (weights) =>
    set((s) => ({ config: { ...s.config, riskWeights: { ...s.config.riskWeights, ...weights } } })),
  setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
  reset: () => set({ config: clone(defaultConfig) }),
}))

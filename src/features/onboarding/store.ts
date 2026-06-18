/**
 * Onboarding flow store. Holds the current draft and a small list of saved
 * drafts (resume-from-draft), persisted to sessionStorage so a reload doesn't
 * lose captured data. Anchor lookup hydrates the draft from a matching fixture
 * (smart prefill); editing turnover across the tier line re-classifies live.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Application, EntityType, IdentityPath } from '@/data/types'
import { classifyTier } from '@/features/verification/gate'
import { defaultConfig } from '@/data/config'
import {
  type AnchorKind,
  type Draft,
  type StepId,
  ENTITY_PROFILE,
  stepIndex,
} from './draft'

function now(): string {
  return new Date().toISOString()
}

let counter = 0
function newId(): string {
  counter += 1
  return `draft_${Date.now().toString(36)}_${counter}`
}

function emptyDraft(entityType?: EntityType): Draft {
  const anchorKind: AnchorKind = entityType
    ? ENTITY_PROFILE[entityType].primaryAnchor
    : 'pan'
  return {
    id: newId(),
    createdAt: now(),
    updatedAt: now(),
    status: 'draft',
    entityType,
    anchorKind,
    anchor: '',
    channel: 'agent',
    people: [],
    beneficialOwners: [],
    documents: [],
    docChannel: 'WhatsApp',
    identityPaths: {},
    pennyDrop: { status: 'idle' },
    premises: {},
    fatca: {},
    furthestStep: 'start',
  }
}

interface OnboardingStore {
  drafts: Record<string, Draft>
  currentId?: string

  current: () => Draft | undefined
  startNew: (entityType?: EntityType) => string
  open: (id: string) => void
  update: (patch: Partial<Draft>) => void
  setTurnover: (rupees: number) => void
  setIdentityPath: (personId: string, path: IdentityPath) => void
  prefillFrom: (app: Application) => void
  markFurthest: (step: StepId) => void
  submit: () => void
  discard: (id: string) => void
  resetAll: () => void
}

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      drafts: {},
      currentId: undefined,

      current: () => {
        const { drafts, currentId } = get()
        return currentId ? drafts[currentId] : undefined
      },

      startNew: (entityType) => {
        const draft = emptyDraft(entityType)
        set((s) => ({ drafts: { ...s.drafts, [draft.id]: draft }, currentId: draft.id }))
        return draft.id
      },

      open: (id) => set({ currentId: id }),

      update: (patch) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.drafts[id]) return s
          return {
            drafts: { ...s.drafts, [id]: { ...s.drafts[id], ...patch, updatedAt: now() } },
          }
        }),

      setTurnover: (rupees) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.drafts[id]) return s
          const tier = classifyTier(rupees, defaultConfig)
          return {
            drafts: {
              ...s.drafts,
              [id]: { ...s.drafts[id], declaredTurnover: rupees, tier, updatedAt: now() },
            },
          }
        }),

      setIdentityPath: (personId, path) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.drafts[id]) return s
          const d = s.drafts[id]
          return {
            drafts: {
              ...s.drafts,
              [id]: { ...d, identityPaths: { ...d.identityPaths, [personId]: path }, updatedAt: now() },
            },
          }
        }),

      prefillFrom: (app) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.drafts[id]) return s
          const d = s.drafts[id]
          const identityPaths: Record<string, IdentityPath> = {}
          app.people.forEach((p) => {
            if (p.identityPath) identityPaths[p.id] = p.identityPath
          })
          const tier = classifyTier(app.declaredTurnover, defaultConfig)
          const prefilledFrom: Draft['prefilledFrom'] = {}
          if (app.gstin) prefilledFrom.gstin = 'GSTN'
          if (app.cin || app.llpin) prefilledFrom[app.cin ? 'cin' : 'llpin'] = 'MCA'
          if (app.entityPan) prefilledFrom.entityPan = 'NSDL'
          if (app.legalName) prefilledFrom.legalName = app.gstin ? 'GSTN' : 'NSDL'
          if (app.registeredAddress) prefilledFrom.registeredAddress = app.gstin ? 'GSTN' : 'MCA'

          return {
            drafts: {
              ...s.drafts,
              [id]: {
                ...d,
                sourceAppId: app.id,
                entityType: app.entityType,
                tier,
                legalName: app.legalName,
                tradeName: app.tradeName,
                entityPan: app.entityPan,
                gstin: app.gstin,
                cin: app.cin,
                llpin: app.llpin,
                udyam: app.udyam,
                registeredAddress: app.registeredAddress,
                state: app.state,
                declaredTurnover: app.declaredTurnover,
                exposure: app.exposure,
                bankShare: app.bankShare,
                prefilledFrom,
                people: app.people.map((p) => ({ ...p })),
                beneficialOwners: app.beneficialOwners.map((b) => ({ ...b })),
                documents: app.documents.map((doc) => ({ ...doc })),
                identityPaths,
                updatedAt: now(),
              },
            },
          }
        }),

      markFurthest: (step) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.drafts[id]) return s
          const d = s.drafts[id]
          const furthest = stepIndex(step) > stepIndex(d.furthestStep) ? step : d.furthestStep
          if (furthest === d.furthestStep) return s
          return { drafts: { ...s.drafts, [id]: { ...d, furthestStep: furthest } } }
        }),

      submit: () =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.drafts[id]) return s
          return { drafts: { ...s.drafts, [id]: { ...s.drafts[id], status: 'submitted', updatedAt: now() } } }
        }),

      discard: (id) =>
        set((s) => {
          const drafts = { ...s.drafts }
          delete drafts[id]
          return { drafts, currentId: s.currentId === id ? undefined : s.currentId }
        }),

      resetAll: () => set({ drafts: {}, currentId: undefined }),
    }),
    { name: 'secureid.onboarding', storage: createJSONStorage(() => sessionStorage) },
  ),
)

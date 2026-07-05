import { create } from 'zustand';
import { membersFor, type EntityId } from '@/lib/entities';

export type CollectMethod = 'upload' | 'link';

/**
 * Cross-screen state for the KYB onboarding journey. Screens read what they need
 * and call `set(...)` on navigation to thread context forward — mirrors the
 * `location.state` plumbing of the web reference, but survives back/forward.
 */
interface FlowState {
  entity: EntityId;
  /** Fetched partners (LLP) / directors (company). */
  members: string[];
  /** Director/partner authorised to operate the account. */
  signatory: string;
  /** Document-collection method chosen on the checklist. */
  method: CollectMethod;
  set: (patch: Partial<Omit<FlowState, 'set' | 'reset'>>) => void;
  /** Reset to a fresh proprietorship — called from the Start screen. */
  reset: () => void;
}

const initial = {
  entity: 'prop' as EntityId,
  members: membersFor('prop'),
  signatory: 'Ravi Kumar',
  method: 'link' as CollectMethod,
};

export const useFlow = create<FlowState>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () => set({ ...initial }),
}));

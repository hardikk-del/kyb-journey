import { create } from 'zustand';
import { membersFor, type EntityId } from '@/lib/entities';

export type CollectMethod = 'upload' | 'link';

/** A person carried forward from Entity & ownership, selectable on later screens. */
export interface Person {
  id: string;
  name: string;
  designation: string;
}

/**
 * Cross-screen state for the KYB onboarding journey. Screens read what they need
 * and call `set(...)` on navigation to thread context forward — mirrors the
 * `location.state` plumbing of the web reference, but survives back/forward.
 */
interface FlowState {
  entity: EntityId;
  /** Fetched partners (LLP) / directors (company). */
  members: string[];
  /** People captured on Entity & ownership — the pool for the board resolution. */
  people: Person[];
  /** Director/partner authorised to operate the account. */
  signatory: string;
  /** Document-collection method chosen on the checklist. */
  method: CollectMethod;
  /**
   * Business-proof documents the user chose to upload later — an agent collects
   * these over WhatsApp within 7 days. Surfaced on the submitted screen.
   */
  deferredDocs: string[];
  set: (patch: Partial<Omit<FlowState, 'set' | 'reset'>>) => void;
  /** Reset to a fresh proprietorship — called from the Start screen. */
  reset: () => void;
}

const initial = {
  entity: 'prop' as EntityId,
  members: membersFor('prop'),
  people: [] as Person[],
  signatory: 'Ravi Kumar',
  method: 'link' as CollectMethod,
  deferredDocs: [] as string[],
};

export const useFlow = create<FlowState>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () => set({ ...initial }),
}));

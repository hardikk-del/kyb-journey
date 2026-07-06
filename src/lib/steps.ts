import { useFlow } from '@/store/flow';
import type { EntityId } from './entities';

/**
 * A journey "phase" — the coarse steps shown in the header ("STEP i OF n").
 * Screens map to a phase; several screens can share one (e.g. checklist,
 * link-sent and review are all the "documents" phase). Numbering is derived per
 * entity so every journey shows clean integers with its own total, instead of
 * the fractional inserts (1.5, 3.5) the fixed-scale approach produced.
 */
export type Phase =
  | 'entity'
  | 'ownership'
  | 'partners'
  | 'signatory'
  | 'documents'
  | 'proof'
  | 'declaration'
  | 'business'
  | 'banking'
  | 'site'
  | 'account'
  | 'signature'
  | 'aof';

const SEQ: Record<'prop' | 'llp' | 'ltd', Phase[]> = {
  // Proprietorship / partnership / HUF — the linear flow.
  prop: ['entity', 'documents', 'proof', 'declaration', 'business', 'site', 'account', 'signature', 'aof'],
  // LLP — partner contacts + tracking inserted after entity details.
  llp: ['entity', 'partners', 'documents', 'proof', 'declaration', 'business', 'site', 'account', 'signature', 'aof'],
  // Company — document checklist up front, then entity & ownership confirmation,
  // signatory KYC, business details, and business proof (split across three doc
  // screens, all under the 'proof' phase).
  ltd: ['documents', 'entity', 'ownership', 'signatory', 'business', 'banking', 'proof', 'declaration', 'site', 'account', 'signature', 'aof'],
};

function seqFor(entity: EntityId): Phase[] {
  if (entity === 'llp') return SEQ.llp;
  if (entity === 'ltd') return SEQ.ltd;
  return SEQ.prop;
}

export function step(entity: EntityId, phase: Phase): { stepLabel: string; progress: number } {
  const seq = seqFor(entity);
  const idx = seq.indexOf(phase);
  const i = idx < 0 ? 1 : idx + 1;
  const total = seq.length;
  return { stepLabel: `STEP ${i} OF ${total}`, progress: Math.round((i / total) * 100) };
}

/** Reactive step header for the current journey's entity. */
export function useStepHeader(phase: Phase) {
  const entity = useFlow((s) => s.entity);
  return step(entity, phase);
}

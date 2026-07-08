import { useEffect } from 'react';
import { View } from 'react-native';
import { Check, ShieldCheck } from 'lucide-react-native';
import { Txt } from '../Txt';
import { cn } from '@/lib/cn';
import { C, shadowXs } from '@/lib/tokens';

export interface ReviewField {
  label: string;
  /** Value read off the uploaded document. */
  value: string;
  /** Render the value in the mono face (IDs like CIN / PAN). */
  mono?: boolean;
  /** Defaults to true. A matched / passed field. */
  matched?: boolean;
  /** Chip label once confirmed. Defaults to the review `source` (e.g. "MCA"). */
  chip?: string;
}

/* ---------------- one reconciled field row ---------------- */

function FieldRow({ field, last, source }: { field: ReviewField; last?: boolean; source: string }) {
  const matched = field.matched !== false;
  return (
    <View className={cn('flex-row items-start justify-between gap-3 px-3.5 py-3', last ? '' : 'border-b border-line')}>
      <View className="flex-1 gap-0.5">
        <Txt weight={500} className="text-[11.5px] uppercase tracking-[0.4px] text-ink-3">
          {field.label}
        </Txt>
        <Txt weight={600} mono={field.mono} className={cn('text-ink', field.mono ? 'text-[13px]' : 'text-[14px] leading-[19px]')}>
          {field.value}
        </Txt>
      </View>

      {matched ? (
        <View className="mt-0.5 h-6 flex-row items-center gap-1 rounded-full border border-green-300 bg-green-50 pl-1.5 pr-2">
          <Check size={12} color={C.posFg} strokeWidth={2.75} />
          <Txt weight={600} className="text-[11px] text-green-700">
            {field.chip ?? source}
          </Txt>
        </View>
      ) : (
        <View className="mt-0.5 h-6 flex-row items-center rounded-full border border-amber-300 bg-amber-50 px-2">
          <Txt weight={600} className="text-[11px] text-amber-700">
            Review
          </Txt>
        </View>
      )}
    </View>
  );
}

/**
 * Post-extraction verification result. Renders as a finished internal check: each
 * field reconciled against a trusted source (the MCA registry), with a
 * plain-language conclusion. No streaming animation.
 */
export function AiExtractReview({
  fields,
  source = 'MCA',
  subtitle = 'Cross-checked with the MCA registry',
  verdict,
  summary,
  onComplete,
}: {
  fields: ReviewField[];
  /** Short source label shown on each match chip (e.g. "MCA"). */
  source?: string;
  /** Header second line. */
  subtitle?: string;
  /** Final pill label. Defaults to "{matched}/{total} matched". */
  verdict?: string;
  /** One-line plain-language conclusion. */
  summary: string;
  /** Fired once (the result is shown complete on mount). */
  onComplete?: () => void;
}) {
  const total = fields.length;
  const matchedTotal = fields.filter((f) => f.matched !== false).length;

  // The result is complete on first paint — signal readiness so the screen's
  // Continue button enables.
  useEffect(() => {
    onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={shadowXs} className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
      {/* header */}
      <View className="flex-row items-center gap-2.5 px-3.5 pb-3 pt-3.5">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck size={16} color={C.brand} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Txt weight={700} className="text-[14.5px] text-ink">
            Document review
          </Txt>
          <Txt className="text-[12px] text-ink-3">{subtitle}</Txt>
        </View>
        <View className="h-7 flex-row items-center gap-1 rounded-full bg-green-500 px-2.5">
          <Check size={13} color="#fff" strokeWidth={3} />
          <Txt weight={700} className="text-[12px] text-white">
            {verdict ?? `${matchedTotal}/${total} matched`}
          </Txt>
        </View>
      </View>

      {/* reconciled fields */}
      <View className="mx-3.5 rounded-lg border border-line bg-card">
        {fields.map((f, i) => (
          <FieldRow key={f.label} field={f} last={i === total - 1} source={source} />
        ))}
      </View>

      {/* conclusion */}
      <View className="px-3.5 pb-3.5 pt-3">
        <View className="flex-row gap-2">
          <View className="mt-[3px] h-4 w-4 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck size={9} color={C.brand} strokeWidth={2.5} />
          </View>
          <Txt weight={500} className="flex-1 text-[13px] leading-[19px] text-ink-2">
            {summary}
          </Txt>
        </View>
      </View>
    </View>
  );
}

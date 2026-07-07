import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Check, ShieldCheck } from 'lucide-react-native';
import { Txt } from '../Txt';
import { cn } from '@/lib/cn';
import { C, shadowXs } from '@/lib/tokens';
import { FadeIn, StreamingText } from './AiExtractReview';

export interface ConsistencyRow {
  /** Attribute checked, e.g. "Business name". */
  label: string;
  /** Reconciled value. */
  value: string;
  /** Chip label once confirmed (e.g. "Consistent"). */
  chip: string;
}

/* ---------------- one consistency row ---------------- */

function Row({ row, confirmed, last }: { row: ConsistencyRow; confirmed: boolean; last?: boolean }) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3 px-3.5 py-2.5', last ? '' : 'border-b border-line')}>
      <View className="flex-1">
        <Txt weight={500} className="text-[11.5px] uppercase tracking-[0.4px] text-ink-3">
          {row.label}
        </Txt>
        <Txt weight={600} numberOfLines={2} className="text-[14px] leading-[18px] text-ink">
          {row.value}
        </Txt>
      </View>
      {confirmed ? (
        <View className="h-6 flex-row items-center gap-1 rounded-full border border-green-300 bg-green-50 pl-1.5 pr-2">
          <Check size={12} color={C.posFg} strokeWidth={2.75} />
          <Txt weight={600} className="text-[11px] text-green-700">
            {row.chip}
          </Txt>
        </View>
      ) : (
        <ActivityIndicator size="small" color={C.ink3} />
      )}
    </View>
  );
}

/**
 * The final AI business review. Reconciles the entity name, address and activity
 * across every document, the MCA record and the site photos, then recommends an
 * MCC. Streams in like a generated response.
 */
export function BusinessReview({
  rows,
  sources,
  summary,
  onComplete,
}: {
  rows: ConsistencyRow[];
  /** The evidence cross-checked, shown once as compact pills. */
  sources: string[];
  summary: string;
  onComplete?: () => void;
}) {
  const total = rows.length;
  const [visible, setVisible] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [summaryOn, setSummaryOn] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 250;
    for (let i = 0; i < total; i++) {
      const idx = i;
      timers.push(setTimeout(() => setVisible(idx + 1), t));
      timers.push(setTimeout(() => setConfirmed(idx + 1), t + 420));
      t += 700;
    }
    timers.push(setTimeout(() => setSummaryOn(true), t + 500));
    return () => timers.forEach(clearTimeout);
  }, [total]);

  const allChecked = confirmed >= total;

  return (
    <View style={shadowXs} className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
      {/* header */}
      <View className="flex-row items-center gap-2.5 px-3.5 pb-3 pt-3.5">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck size={16} color={C.brand} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Txt weight={700} className="text-[14.5px] text-ink">
            Internal verification check
          </Txt>
          <Txt className="text-[12px] text-ink-3">Final cross-document check</Txt>
        </View>
        {allChecked ? (
          <View className="h-7 flex-row items-center gap-1 rounded-full bg-green-500 px-2.5">
            <Check size={13} color="#fff" strokeWidth={3} />
            <Txt weight={700} className="text-[12px] text-white">
              Consistent
            </Txt>
          </View>
        ) : (
          <View className="h-7 flex-row items-center gap-1.5 rounded-full bg-blue-100 pl-2 pr-2.5">
            <ActivityIndicator size="small" color={C.brand} />
            <Txt weight={600} className="text-[12px] text-brand">
              Reviewing
            </Txt>
          </View>
        )}
      </View>

      {/* consistency rows */}
      <View className="mx-3.5 rounded-lg border border-line bg-card">
        {rows.slice(0, visible).map((r, i) => (
          <FadeIn key={r.label}>
            <Row row={r} confirmed={i < confirmed} last={i === total - 1} />
          </FadeIn>
        ))}
      </View>

      {/* sources cross-checked (shown once, compact) */}
      {allChecked ? (
        <FadeIn>
          <View className="flex-row flex-wrap items-center gap-1.5 px-3.5 pt-2.5">
            <Txt weight={500} className="text-[11px] text-ink-3">
              Cross-checked
            </Txt>
            {sources.map((s) => (
              <View key={s} className="rounded-full bg-white px-2 py-0.5">
                <Txt weight={500} className="text-[11px] text-ink-2">
                  {s}
                </Txt>
              </View>
            ))}
          </View>
        </FadeIn>
      ) : null}

      {/* streamed verdict */}
      <View className="px-3.5 pb-3.5 pt-3">
        {summaryOn ? (
          <View className="flex-row gap-2">
            <View className="mt-[3px] h-4 w-4 items-center justify-center rounded-full bg-blue-100">
              <ShieldCheck size={9} color={C.brand} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <StreamingText text={summary} onDone={onComplete} />
            </View>
          </View>
        ) : (
          <Txt weight={500} className="text-[13px] text-ink-3">
            Preparing summary…
          </Txt>
        )}
      </View>
    </View>
  );
}

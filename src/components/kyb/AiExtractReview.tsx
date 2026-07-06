import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, View } from 'react-native';
import { Check, Sparkles } from 'lucide-react-native';
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

/* ---------------- blinking caret (streaming cursor) ---------------- */

function Caret() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((o) => !o), 450);
    return () => clearInterval(id);
  }, []);
  return (
    <Txt weight={600} className={cn('text-[13px] text-brand', on ? 'opacity-100' : 'opacity-0')}>
      ▍
    </Txt>
  );
}

/* ---------------- token-by-token text ---------------- */

export function StreamingText({ text, onDone }: { text: string; onDone?: () => void }) {
  // Split into word-plus-space chunks so it reveals like generated tokens.
  const tokens = useMemo(() => text.match(/\S+\s*/g) ?? [], [text]);
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (n >= tokens.length) {
      if (!done.current) {
        done.current = true;
        onDone?.();
      }
      return;
    }
    const id = setTimeout(() => setN((c) => c + 1), 40);
    return () => clearTimeout(id);
  }, [n, tokens.length, onDone]);

  const streaming = n < tokens.length;
  return (
    <Txt weight={500} className="text-[13px] leading-[19px] text-ink-2">
      {tokens.slice(0, n).join('')}
      {streaming ? <Caret /> : null}
    </Txt>
  );
}

/* ---------------- mount fade-in for a revealed row ---------------- */

export function FadeIn({ children }: { children: React.ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [a]);
  return (
    <Animated.View
      style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}
    >
      {children}
    </Animated.View>
  );
}

/* ---------------- one reconciled field row ---------------- */

function FieldRow({ field, confirmed, last, source }: { field: ReviewField; confirmed: boolean; last?: boolean; source: string }) {
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

      {!confirmed ? (
        <View className="mt-0.5 h-6 flex-row items-center gap-1.5 rounded-full border border-line bg-grey-50 pl-1.5 pr-2">
          <ActivityIndicator size="small" color={C.ink3} />
          <Txt weight={500} className="text-[11px] text-ink-3">
            Checking
          </Txt>
        </View>
      ) : matched ? (
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
 * Post-extraction AI review. Streams in like a generated response: each field
 * is revealed and reconciled against a trusted source (the MCA registry) one at
 * a time, then a plain-language verdict types out token by token.
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
  /** Final pill label once done. Defaults to "{matched}/{total} matched". */
  verdict?: string;
  /** One-line plain-language verdict, streamed at the end. */
  summary: string;
  /** Fired once the whole review has finished streaming. */
  onComplete?: () => void;
}) {
  const total = fields.length;
  const [visible, setVisible] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [summaryOn, setSummaryOn] = useState(false);

  // Drive the reveal timeline once on mount: field appears, gets checked against
  // MCA a beat later, then the next one, then the verdict streams.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 250;
    for (let i = 0; i < total; i++) {
      const idx = i;
      timers.push(setTimeout(() => setVisible(idx + 1), t));
      timers.push(setTimeout(() => setConfirmed(idx + 1), t + 460));
      t += 820;
    }
    timers.push(setTimeout(() => setSummaryOn(true), t + 120));
    return () => timers.forEach(clearTimeout);
  }, [total]);

  const matchedTotal = fields.filter((f) => f.matched !== false).length;
  const allChecked = confirmed >= total;

  return (
    <View style={shadowXs} className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
      {/* header */}
      <View className="flex-row items-center gap-2.5 px-3.5 pb-3 pt-3.5">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <Sparkles size={16} color={C.brand} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Txt weight={700} className="text-[14.5px] text-ink">
            AI document review
          </Txt>
          <Txt className="text-[12px] text-ink-3">{subtitle}</Txt>
        </View>
        {allChecked ? (
          <View className="h-7 flex-row items-center gap-1 rounded-full bg-green-500 px-2.5">
            <Check size={13} color="#fff" strokeWidth={3} />
            <Txt weight={700} className="text-[12px] text-white">
              {verdict ?? `${matchedTotal}/${total} matched`}
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

      {/* reconciled fields (revealed progressively) */}
      <View className="mx-3.5 rounded-lg border border-line bg-card">
        {fields.slice(0, visible).map((f, i) => (
          <FadeIn key={f.label}>
            <FieldRow field={f} confirmed={i < confirmed} last={i === total - 1} source={source} />
          </FadeIn>
        ))}
      </View>

      {/* streamed verdict */}
      <View className="px-3.5 pb-3.5 pt-3">
        {summaryOn ? (
          <View className="flex-row gap-2">
            <View className="mt-[3px] h-4 w-4 items-center justify-center rounded-full bg-blue-100">
              <Sparkles size={9} color={C.brand} strokeWidth={2.5} />
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

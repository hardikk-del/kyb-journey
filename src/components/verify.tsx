import { View } from 'react-native';
import { Check, AlertTriangle, X, Sparkles } from 'lucide-react-native';
import { Txt } from './Txt';
import { cn } from '@/lib/cn';

export function Panel({
  children,
  className,
  pad = 'p-3.5',
}: {
  children: React.ReactNode;
  className?: string;
  pad?: string;
}) {
  return <View className={cn('rounded-xl border border-line bg-card', pad, className)}>{children}</View>;
}

export function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View className="mb-0.5 flex-row items-center justify-between">
      <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
        {children}
      </Txt>
      {right}
    </View>
  );
}

type SourceTone = 'neutral' | 'info' | 'positive';

const SOURCE_TONE: Record<SourceTone, string> = {
  neutral: 'bg-grey-100 border-line',
  info: 'bg-blue-50 border-blue-200',
  positive: 'bg-green-50 border-green-300',
};
const SOURCE_TEXT: Record<SourceTone, string> = {
  neutral: 'text-ink-3',
  info: 'text-blue-600',
  positive: 'text-green-700',
};

export function SourceTag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: SourceTone }) {
  return (
    <View className={cn('rounded-sm border px-1.5 py-px', SOURCE_TONE[tone])}>
      <Txt mono className={cn('text-[9.5px]', SOURCE_TEXT[tone])}>
        {children}
      </Txt>
    </View>
  );
}

export type VState = 'verified' | 'pending' | 'flagged' | 'error' | 'idle';

export function StateIcon({ state = 'verified', size = 20 }: { state?: VState; size?: number }) {
  const box = { width: size, height: size };
  if (state === 'idle') {
    return <View style={box} className="rounded-full border-[1.5px] border-dashed border-line-strong" />;
  }
  if (state === 'pending') {
    return (
      <View style={box} className="items-center justify-center rounded-full border-[2.5px] border-blue-100 border-t-blue-500" />
    );
  }
  const bg =
    state === 'verified' ? 'bg-green-500' : state === 'flagged' ? 'bg-amber-500' : 'bg-red-500';
  const Icon = state === 'verified' ? Check : state === 'flagged' ? AlertTriangle : X;
  return (
    <View style={box} className={cn('items-center justify-center rounded-full', bg)}>
      <Icon size={size * 0.6} color="#fff" strokeWidth={2.4} />
    </View>
  );
}

interface VerifyRowProps {
  label: string;
  value: string;
  mono?: boolean;
  source?: string;
  sourceTone?: SourceTone;
  state?: VState;
  sub?: string;
  last?: boolean;
}

export function VerifyRow({ label, value, mono, source, sourceTone = 'neutral', state, sub, last }: VerifyRowProps) {
  return (
    <View className={cn('flex-row items-start gap-3 py-2.5', !last && 'border-b border-line')}>
      <View className="flex-1">
        <Txt weight={500} className="mb-1 text-[11px] uppercase tracking-[0.4px] text-ink-3">
          {label}
        </Txt>
        <Txt weight={600} mono={mono} className="text-[14px] leading-[18px] text-ink">
          {value}
        </Txt>
        {source || sub ? (
          <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
            {source ? <SourceTag tone={sourceTone}>{source}</SourceTag> : null}
            {sub ? <Txt className="text-[11px] text-ink-3">{sub}</Txt> : null}
          </View>
        ) : null}
      </View>
      {state ? (
        <View className="pt-3.5">
          <StateIcon state={state} />
        </View>
      ) : null}
    </View>
  );
}

export function TierChip({ tier = 'simplified' }: { tier?: 'simplified' | 'full' }) {
  const simple = tier === 'simplified';
  return (
    <View
      className={cn(
        'h-[26px] flex-row items-center gap-1.5 rounded-full border px-2.5',
        simple ? 'border-green-300 bg-green-50' : 'border-blue-200 bg-blue-50',
      )}
    >
      <Sparkles size={13} color={simple ? 'rgb(0,134,65)' : 'rgb(9,78,255)'} />
      <Txt weight={600} className={cn('text-[12px]', simple ? 'text-green-700' : 'text-blue-700')}>
        {simple ? 'Simplified DD' : 'Full CDD'}
      </Txt>
    </View>
  );
}

type BadgeTone = 'positive' | 'info' | 'warning' | 'negative';
const BADGE: Record<BadgeTone, { box: string; text: string; dot: string }> = {
  positive: { box: 'bg-green-50 border-green-300', text: 'text-green-700', dot: 'bg-green-500' },
  info: { box: 'bg-blue-50 border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
  warning: { box: 'bg-amber-50 border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' },
  negative: { box: 'bg-red-50 border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
};

export function Badge({ children, tone = 'positive', dot }: { children: React.ReactNode; tone?: BadgeTone; dot?: boolean }) {
  const t = BADGE[tone];
  return (
    <View className={cn('h-6 flex-row items-center gap-1.5 rounded-full border px-2', t.box)}>
      {dot ? <View className={cn('h-[7px] w-[7px] rounded-full', t.dot)} /> : null}
      <Txt weight={600} className={cn('text-[11.5px]', t.text)}>
        {children}
      </Txt>
    </View>
  );
}

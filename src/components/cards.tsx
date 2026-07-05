import { Pressable, View } from 'react-native';
import { Check, User, Link2 } from 'lucide-react-native';
import { Txt } from './Txt';
import { Button } from './Button';
import { cn } from '@/lib/cn';

/** Small circular check / radio indicator used across selectable cards. */
function CheckCircle({ selected, square }: { selected?: boolean; square?: boolean }) {
  return (
    <View
      className={cn(
        'h-5 w-5 items-center justify-center border-[1.5px]',
        square ? 'rounded-[5px]' : 'rounded-full',
        selected ? 'border-blue-500 bg-blue-500' : 'border-line-strong bg-transparent',
      )}
    >
      {selected ? <Check size={11} color="#fff" strokeWidth={2.4} /> : null}
    </View>
  );
}

export function EntityCard({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 gap-2 rounded-lg border-[1.5px] p-3',
        selected ? 'border-blue-500 bg-blue-50' : 'border-line bg-card',
      )}
    >
      <View className="flex-row items-center justify-between">
        {icon}
        <CheckCircle selected={selected} />
      </View>
      <Txt weight={600} className={cn('text-[13px]', selected ? 'text-blue-700' : 'text-ink')}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SelectCard({
  icon,
  title,
  desc,
  selected,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-lg border-[1.5px] p-3',
        selected ? 'border-blue-500 bg-blue-50' : 'border-line bg-card',
      )}
    >
      <View
        className={cn(
          'h-[38px] w-[38px] items-center justify-center rounded-[9px]',
          selected ? 'bg-blue-500' : 'bg-grey-100',
        )}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Txt weight={600} className={cn('text-[13.5px]', selected ? 'text-blue-700' : 'text-ink-2')}>
          {title}
        </Txt>
        {desc ? <Txt className="mt-0.5 text-[11.5px] text-ink-3">{desc}</Txt> : null}
      </View>
      <CheckCircle selected={selected} />
    </Pressable>
  );
}

export function ConsentRow({ label, desc, last }: { label: string; desc: string; last?: boolean }) {
  return (
    <View className={cn('flex-row items-start gap-2.5 py-2.5', !last && 'border-b border-line')}>
      <View className="mt-px h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-green-500">
        <Check size={11} color="#fff" strokeWidth={2.2} />
      </View>
      <View className="flex-1">
        <Txt weight={600} className="text-[13.5px] text-ink">
          {label}
        </Txt>
        <Txt className="mt-px text-[11.5px] text-ink-3">{desc}</Txt>
      </View>
    </View>
  );
}

export function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-2.5">
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-blue-500' : 'border-line-strong',
        )}
      >
        {selected ? <View className="h-[9px] w-[9px] rounded-full bg-blue-500" /> : null}
      </View>
      <Txt weight={500} className="text-[14px] text-ink">
        {label}
      </Txt>
    </Pressable>
  );
}

export function StepRow({
  n,
  title,
  desc,
  active,
  last,
}: {
  n: number;
  title: string;
  desc?: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={cn(
            'h-[26px] w-[26px] items-center justify-center rounded-full',
            active ? 'bg-ink' : 'border border-line bg-grey-100',
          )}
        >
          <Txt weight={700} className={cn('text-[12.5px]', active ? 'text-white' : 'text-ink-3')}>
            {n}
          </Txt>
        </View>
        {!last ? <View className="mt-1 w-0.5 flex-1 bg-line" /> : null}
      </View>
      <View className="flex-1 pb-3.5">
        <Txt weight={600} className="text-[14.5px] text-ink">
          {title}
        </Txt>
        {desc ? <Txt className="mt-0.5 text-[12px] text-ink-3">{desc}</Txt> : null}
      </View>
    </View>
  );
}

export function Handoff({
  title = 'Customer action required',
  desc,
  compact,
}: {
  title?: string;
  desc?: string;
  compact?: boolean;
}) {
  return (
    <View className={cn('overflow-hidden rounded-xl border border-blue-200 bg-blue-50', compact ? 'p-3.5' : 'p-4')}>
      <View className="mb-3 flex-row items-center gap-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-blue-500">
          <User size={20} color="#fff" />
        </View>
        <View className="flex-1">
          <Txt weight={600} className="text-[13.5px] text-blue-700">
            {title}
          </Txt>
          {desc ? <Txt className="mt-px text-[11.5px] text-ink-2">{desc}</Txt> : null}
        </View>
      </View>
      <View className="flex-row gap-2">
        <Button
          label="Hand device over"
          size="medium"
          fullWidth
          leadingIcon={<User size={16} color="#fff" />}
        />
        <Button
          label="Send link"
          variant="secondary"
          size="medium"
          fullWidth
          leadingIcon={<Link2 size={16} color="rgb(27,27,27)" />}
        />
      </View>
    </View>
  );
}

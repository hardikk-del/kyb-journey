import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { ChevronDown, Check, Users, X } from 'lucide-react-native';
import { Txt } from '../Txt';
import { cn } from '@/lib/cn';
import { C, shadowXs } from '@/lib/tokens';
import type { Person } from '@/store/flow';

/* ---------------- required marker + field label ---------------- */

export function Req() {
  return <Txt className="text-red-500"> *</Txt>;
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Txt weight={600} className="text-[13px] text-ink-2">
      {children}
      {required ? <Req /> : null}
    </Txt>
  );
}

/* ---------------- eyebrow ---------------- */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Txt weight={600} className="text-[11px] uppercase tracking-[0.8px] text-ink-3">
      {children}
    </Txt>
  );
}

/* ---------------- segmented control ---------------- */

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  height = 44,
}: {
  value: T | null;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  height?: number;
}) {
  return (
    <View className="flex-row gap-1 rounded-xl bg-grey-100 p-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[{ height }, active ? shadowXs : undefined]}
            className={cn('flex-1 flex-row items-center justify-center gap-1.5 rounded-lg', active ? 'bg-card' : '')}
          >
            {o.icon}
            <Txt weight={600} className={cn('text-[14px]', active ? 'text-ink' : 'text-ink-3')}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------- dropdown (modal picker) ---------------- */

export function Dropdown({
  value,
  options,
  onChange,
  disabled,
  disabledOptions = [],
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  disabledOptions?: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const visible = options.filter((o) => o === value || !disabledOptions.includes(o));

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          'h-12 flex-row items-center justify-between gap-2 rounded-lg border px-3.5',
          disabled ? 'border-line bg-grey-100' : 'border-line-strong bg-card',
        )}
      >
        <Txt weight={500} numberOfLines={1} className={cn('flex-1 text-[14px]', value ? 'text-ink' : 'text-ink-3')}>
          {value || placeholder}
        </Txt>
        {!disabled ? <ChevronDown size={16} color={C.ink3} strokeWidth={2} /> : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable className="max-h-[70%] rounded-t-2xl bg-card pb-8 pt-2">
            <View className="mb-1 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-line-strong" />
            </View>
            <ScrollView>
              {visible.map((o) => {
                const selected = o === value;
                return (
                  <Pressable
                    key={o}
                    onPress={() => {
                      onChange(o);
                      setOpen(false);
                    }}
                    className="h-12 flex-row items-center justify-between gap-2 px-5 active:bg-grey-50"
                  >
                    <Txt weight={selected ? 600 : 400} className="flex-1 text-[15px] text-ink">
                      {o}
                    </Txt>
                    {selected ? <Check size={18} color={C.brand} strokeWidth={2.5} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ---------------- money input (₹) ---------------- */

const NUM_FONT = { fontFamily: 'DMSans_600SemiBold' as const };

export function MoneyInput({
  value,
  onChange,
  placeholder = 'No limit',
  height = 44,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
}) {
  return (
    <View
      style={{ height }}
      className={cn('flex-row items-center rounded-lg border px-3', value ? 'border-blue-500 bg-blue-50' : 'border-line-strong bg-card')}
    >
      <Txt weight={700} className="mr-1.5 text-[15px] text-ink-3">
        ₹
      </Txt>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="rgb(141,141,141)"
        style={NUM_FONT}
        className="flex-1 text-[15px] text-ink"
      />
    </View>
  );
}

/* ---------------- people multi-select ---------------- */

export function PeopleSelect({
  people,
  selected,
  onChange,
  placeholder = 'Select people',
  single,
}: {
  people: Person[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  /** Single-select mode (e.g. approver) — picking a person closes the sheet. */
  single?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const chosen = people.filter((p) => selected.includes(p.id));

  const toggle = (id: string) => {
    if (single) {
      onChange([id]);
      setOpen(false);
      return;
    }
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="min-h-[48px] flex-row items-center justify-between gap-2 rounded-lg border border-line-strong bg-card px-3 py-2"
      >
        {chosen.length ? (
          <View className="flex-1 flex-row flex-wrap gap-1.5">
            {chosen.map((p) => (
              <View key={p.id} className="flex-row items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-2.5 pr-1.5">
                <Txt weight={600} className="text-[12.5px] text-blue-700">
                  {p.name}
                </Txt>
                <Pressable onPress={() => toggle(p.id)} hitSlop={6} className="h-4 w-4 items-center justify-center rounded-full bg-blue-100">
                  <X size={11} color={C.brand} strokeWidth={2.5} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 flex-row items-center gap-2">
            <Users size={16} color={C.ink3} strokeWidth={2} />
            <Txt weight={500} className="text-[14px] text-ink-3">
              {placeholder}
            </Txt>
          </View>
        )}
        <ChevronDown size={16} color={C.ink3} strokeWidth={2} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable className="max-h-[72%] rounded-t-2xl bg-card pb-8 pt-2">
            <View className="mb-1 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-line-strong" />
            </View>
            <View className="flex-row items-center justify-between px-5 pb-2">
              <Txt weight={700} className="text-[15px] text-ink">
                {single ? 'Select a person' : 'Select people'}
              </Txt>
              {!single ? (
                <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                  <Txt weight={700} className="text-[14px] text-brand">
                    Done
                  </Txt>
                </Pressable>
              ) : null}
            </View>
            <ScrollView>
              {people.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => toggle(p.id)}
                    className="flex-row items-center gap-3 px-5 py-3 active:bg-grey-50"
                  >
                    <View className="flex-1">
                      <Txt weight={600} className="text-[15px] text-ink">
                        {p.name}
                      </Txt>
                      <Txt className="text-[12.5px] text-ink-3">{p.designation}</Txt>
                    </View>
                    {single ? (
                      on ? <Check size={18} color={C.brand} strokeWidth={2.5} /> : null
                    ) : (
                      <Checkbox checked={on} />
                    )}
                  </Pressable>
                );
              })}
              {people.length === 0 ? (
                <Txt className="px-5 py-6 text-center text-[13px] text-ink-3">
                  No people found. Add them on the Entity & ownership screen first.
                </Txt>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ---------------- progress meter (segments) ---------------- */

export function ProgressMeter({ done, total, verb }: { done: number; total: number; verb: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Txt weight={500} className="text-[13px] text-ink-2">
          {done} of {total} {verb}
        </Txt>
        <Txt weight={600} className="text-[13px] text-ink">
          {pct}%
        </Txt>
      </View>
      <View className="flex-row gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} className={cn('h-1.5 flex-1 rounded-full', i < done ? 'bg-green-500' : 'bg-line')} />
        ))}
      </View>
    </View>
  );
}

/* ---------------- section card (numbered) ---------------- */

export function SectionCard({
  index,
  title,
  hint,
  required,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={shadowXs} className="rounded-xl border border-line bg-card p-4">
      <View className="flex-row items-start gap-3 pb-3">
        <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-ink">
          <Txt weight={700} className="text-[12px] text-white">
            {index}
          </Txt>
        </View>
        <View className="flex-1">
          <Txt weight={700} className="text-[16px] tracking-[-0.2px] text-ink">
            {title}
            {required ? <Req /> : null}
          </Txt>
          {hint ? <Txt className="mt-0.5 text-[13px] text-ink-3">{hint}</Txt> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

/* ---------------- checkbox + radio-card ---------------- */

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      className={cn(
        'h-5 w-5 items-center justify-center rounded-md border-2',
        checked ? 'border-blue-500 bg-blue-500' : 'border-line-strong',
      )}
    >
      {checked ? <Check size={12} color="#fff" strokeWidth={3} /> : null}
    </View>
  );
}

export function RadioCard({
  label,
  sub,
  checked,
  onSelect,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'flex-row items-center gap-3 rounded-lg border p-3.5',
        checked ? 'border-blue-500 bg-blue-50' : 'border-line bg-card',
      )}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-full border-2',
          checked ? 'border-blue-500' : 'border-line-strong',
        )}
      >
        {checked ? <View className="h-2.5 w-2.5 rounded-full bg-blue-500" /> : null}
      </View>
      <View className="flex-1">
        <Txt weight={600} className={cn('text-[15px]', checked ? 'text-blue-700' : 'text-ink')}>
          {label}
        </Txt>
        {sub ? <Txt className="mt-0.5 text-[13px] text-ink-3">{sub}</Txt> : null}
      </View>
    </Pressable>
  );
}

/* ---------------- OTP input ---------------- */

export function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const refs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (i: number, raw: string) => {
    const clean = raw.replace(/[^0-9]/g, '');
    const next = digits.slice();
    if (!clean) {
      next[i] = '';
      onChange(next.join(''));
      return;
    }
    next[i] = clean.slice(-1);
    onChange(next.join(''));
    if (i < length - 1) refs.current[i + 1]?.focus();
    else refs.current[i]?.blur();
  };

  return (
    <View className="flex-row justify-between gap-2">
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChangeText={(t) => setDigit(i, t)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          keyboardType="number-pad"
          maxLength={1}
          style={{ fontFamily: 'DMSans_700Bold' }}
          className={cn(
            'h-14 w-12 rounded-xl border text-center text-[20px] text-ink',
            d ? 'border-blue-500 bg-blue-50' : 'border-line-strong bg-card',
          )}
        />
      ))}
    </View>
  );
}

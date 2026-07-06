import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Txt } from '../Txt';
import { cn } from '@/lib/cn';
import { C } from '@/lib/tokens';

// The app renders and stores dates as "DD MMM YYYY" (e.g. 09 Nov 1985). This
// picker reads/writes that exact string so it drops into existing fields.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const SANS_500 = { fontFamily: 'DMSans_500Medium' as const };

function fmt(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function parse(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const mon = MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  const year = Number(m[3]);
  if (mon < 0) return null;
  const d = new Date(year, mon, day);
  return d.getMonth() === mon && d.getDate() === day ? d : null;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function DatePicker({
  value,
  onChange,
  placeholder = 'DD MMM YYYY',
  maximumDate,
  minimumDate,
  height = 48,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  height?: number;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'day' | 'year'>('day');
  // The month currently on screen — seeded from the value / today when opened.
  const [view, setView] = useState<Date>(() => startOfDay(parse(value) ?? maximumDate ?? new Date()));

  const selected = parse(value);
  const max = maximumDate ? startOfDay(maximumDate) : null;
  const min = minimumDate ? startOfDay(minimumDate) : null;

  const openSheet = () => {
    setView(startOfDay(selected ?? max ?? new Date()));
    setMode('day');
    setOpen(true);
  };

  const y = view.getFullYear();
  const m = view.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const disabled = (day: number) => {
    const d = new Date(y, m, day);
    return (max != null && d > max) || (min != null && d < min);
  };

  const shiftMonth = (delta: number) => setView(new Date(y, m + delta, 1));

  const pick = (day: number) => {
    if (disabled(day)) return;
    onChange(fmt(new Date(y, m, day)));
    setOpen(false);
  };

  const maxYear = max ? max.getFullYear() : new Date().getFullYear() + 5;
  const minYear = min ? min.getFullYear() : 1920;
  const years: number[] = [];
  for (let yr = maxYear; yr >= minYear; yr--) years.push(yr);

  return (
    <>
      <Pressable
        onPress={openSheet}
        style={{ height }}
        className="flex-row items-center justify-between gap-2 rounded-lg border border-line-strong bg-card px-3"
      >
        <Txt weight={500} style={SANS_500} className={cn('flex-1 text-[15px]', value ? 'text-ink' : 'text-ink-3')}>
          {value || placeholder}
        </Txt>
        <Calendar size={18} color={C.ink3} strokeWidth={2} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable className="rounded-t-2xl bg-card px-4 pb-8 pt-2">
            <View className="mb-1 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-line-strong" />
            </View>

            {/* month / year header */}
            <View className="flex-row items-center justify-between px-1 py-2">
              <Pressable
                onPress={() => setMode(mode === 'day' ? 'year' : 'day')}
                className="flex-row items-center gap-1.5 rounded-lg px-2 py-1.5 active:bg-grey-100"
              >
                <Txt weight={700} className="text-[16px] text-ink">
                  {MONTHS[m]} {y}
                </Txt>
                <ChevronRight size={16} color={C.ink3} strokeWidth={2.5} style={{ transform: [{ rotate: '90deg' }] }} />
              </Pressable>
              {mode === 'day' ? (
                <View className="flex-row items-center gap-1">
                  <Pressable onPress={() => shiftMonth(-1)} className="h-9 w-9 items-center justify-center rounded-full active:bg-grey-100">
                    <ChevronLeft size={20} color={C.ink2} strokeWidth={2} />
                  </Pressable>
                  <Pressable onPress={() => shiftMonth(1)} className="h-9 w-9 items-center justify-center rounded-full active:bg-grey-100">
                    <ChevronRight size={20} color={C.ink2} strokeWidth={2} />
                  </Pressable>
                </View>
              ) : null}
            </View>

            {mode === 'day' ? (
              <View className="pt-1">
                {/* weekday labels */}
                <View className="flex-row">
                  {WEEKDAYS.map((w, i) => (
                    <View key={i} className="flex-1 items-center py-1.5">
                      <Txt weight={600} className="text-[11px] uppercase text-ink-3">
                        {w}
                      </Txt>
                    </View>
                  ))}
                </View>
                {/* day grid */}
                {weeks.map((week, wi) => (
                  <View key={wi} className="flex-row">
                    {week.map((day, di) => {
                      if (day == null) return <View key={di} className="h-11 flex-1" />;
                      const isSel = selected != null && sameDay(selected, new Date(y, m, day));
                      const off = disabled(day);
                      return (
                        <Pressable key={di} onPress={() => pick(day)} disabled={off} className="h-11 flex-1 items-center justify-center">
                          <View
                            className={cn(
                              'h-9 w-9 items-center justify-center rounded-full',
                              isSel ? 'bg-blue-500' : '',
                            )}
                          >
                            <Txt weight={isSel ? 700 : 500} className={cn('text-[15px]', isSel ? 'text-white' : off ? 'text-ink-3/40' : 'text-ink')}>
                              {day}
                            </Txt>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false} className="pt-1">
                <View className="flex-row flex-wrap">
                  {years.map((yr) => {
                    const isSel = yr === y;
                    return (
                      <Pressable
                        key={yr}
                        onPress={() => {
                          setView(new Date(yr, m, 1));
                          setMode('day');
                        }}
                        className="w-1/4 items-center py-2"
                      >
                        <View className={cn('h-10 w-16 items-center justify-center rounded-full', isSel ? 'bg-blue-500' : '')}>
                          <Txt weight={isSel ? 700 : 500} className={cn('text-[15px]', isSel ? 'text-white' : 'text-ink')}>
                            {yr}
                          </Txt>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

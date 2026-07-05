import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Plus, Trash2, Info, ShieldCheck, UserCheck } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Checkbox, Dropdown, FieldLabel, SectionCard } from '@/components/kyb/controls';
import { useFlow } from '@/store/flow';
import { membersInfoFor, type MemberInfo } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type Holder = { id: number; name: string; type: 'Individual' | 'Body Corporate'; pct: string };
const HOLDER_TYPES = ['Individual', 'Body Corporate'];
const UBO_THRESHOLD = 25;

const inputCls = 'h-11 rounded-lg border border-line-strong bg-card px-3 text-[14px] text-ink';

export default function ShareholdingScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const directors = flow.members;
  const info = membersInfoFor(entity);
  const infoFor = (name: string): MemberInfo | undefined => info.find((m) => m.name === name);

  const [holders, setHolders] = useState<Holder[]>([
    { id: 0, name: 'Ravi Kumar', type: 'Individual', pct: '40' },
    { id: 1, name: 'Rahul Mishra', type: 'Individual', pct: '35' },
    { id: 2, name: 'Anjali Sharma', type: 'Individual', pct: '15' },
    { id: 3, name: 'Finramp Holdings LLP', type: 'Body Corporate', pct: '10' },
  ]);
  const [seniorOfficial, setSeniorOfficial] = useState('');
  const [declared, setDeclared] = useState(true);

  const total = holders.reduce((sum, h) => sum + (Number(h.pct) || 0), 0);
  const totalOk = total === 100;
  const ubos = holders.filter((h) => h.type === 'Individual' && (Number(h.pct) || 0) > UBO_THRESHOLD);
  const hasUbo = ubos.length > 0;

  const setHolder = (id: number, patch: Partial<Holder>) =>
    setHolders((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const addHolder = () =>
    setHolders((prev) => [...prev, { id: (prev[prev.length - 1]?.id ?? 0) + 1, name: '', type: 'Individual', pct: '' }]);
  const removeHolder = (id: number) => setHolders((prev) => prev.filter((h) => h.id !== id));

  const complete = totalOk && declared && (hasUbo || seniorOfficial !== '');

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('shareholding')} title="Shareholding & UBO" />

      <Body className="gap-5">
        <Txt className="-mt-1 text-[14px] leading-[20px] text-ink-2">
          Declare the company's shareholding pattern. Individuals holding more than {UBO_THRESHOLD}% are flagged as
          Ultimate Beneficial Owners.
        </Txt>

        <SectionCard index={1} title="Shareholding pattern" hint="Must total 100%" required>
          <View className="gap-3">
            {holders.map((h) => (
              <View key={h.id} className="gap-3 rounded-lg border border-line bg-grey-100 p-3">
                <View className="flex-row items-center justify-between">
                  <Txt weight={600} className="text-[12px] uppercase tracking-[0.5px] text-ink-3">
                    Shareholder
                  </Txt>
                  {holders.length > 1 ? (
                    <Pressable onPress={() => removeHolder(h.id)} hitSlop={6}>
                      <Trash2 size={16} color={C.neg} strokeWidth={2} />
                    </Pressable>
                  ) : null}
                </View>
                <TextInput
                  value={h.name}
                  onChangeText={(t) => setHolder(h.id, { name: t })}
                  placeholder="Shareholder name"
                  placeholderTextColor="rgb(141,141,141)"
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className={inputCls}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Dropdown value={h.type} options={HOLDER_TYPES} onChange={(v) => setHolder(h.id, { type: v as Holder['type'] })} />
                  </View>
                  <View className="h-11 w-[96px] flex-row items-center rounded-lg border border-line-strong bg-card px-3">
                    <TextInput
                      value={h.pct}
                      onChangeText={(t) => setHolder(h.id, { pct: t.replace(/[^0-9]/g, '').slice(0, 3) })}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="rgb(141,141,141)"
                      style={{ fontFamily: 'DMSans_400Regular' }}
                      className="flex-1 text-[14px] text-ink"
                    />
                    <Txt weight={600} className="text-[14px] text-ink-3">
                      %
                    </Txt>
                  </View>
                </View>
              </View>
            ))}

            <Pressable
              onPress={addHolder}
              className="h-9 flex-row items-center gap-1.5 self-start rounded-md border border-line bg-card px-3 active:bg-grey-50"
            >
              <Plus size={16} color={C.ink} strokeWidth={2} />
              <Txt weight={600} className="text-[13px] text-ink">
                Add shareholder
              </Txt>
            </Pressable>

            <View className={cn('mt-1 h-11 flex-row items-center justify-between rounded-lg px-3.5', totalOk ? 'bg-green-50' : 'bg-amber-50')}>
              <Txt weight={600} className={cn('text-[13px]', totalOk ? 'text-green-700' : 'text-amber-700')}>
                Total holding
              </Txt>
              <Txt weight={700} className={cn('text-[15px]', totalOk ? 'text-green-700' : 'text-amber-700')}>
                {total}%
              </Txt>
            </View>
          </View>
        </SectionCard>

        <SectionCard index={2} title="Ultimate Beneficial Owners" hint={`Individuals holding > ${UBO_THRESHOLD}%`} required>
          {hasUbo ? (
            <View className="gap-3">
              {ubos.map((u) => {
                const d = infoFor(u.name);
                return (
                  <View key={u.id} className="gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3.5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <ShieldCheck size={16} color={C.brand} strokeWidth={2} />
                        <Txt weight={700} className="text-[14px] text-ink">
                          {u.name}
                        </Txt>
                      </View>
                      <View className="rounded bg-blue-100 px-2 py-0.5">
                        <Txt weight={700} className="text-[11px] tracking-[0.3px] text-brand">
                          UBO · {u.pct}%
                        </Txt>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between gap-3">
                      <Txt className="text-[13px] text-ink-3">PAN</Txt>
                      <Txt weight={600} className="text-[13.5px] text-ink">
                        {d?.pan ?? '—'}
                      </Txt>
                    </View>
                    {d?.address ? (
                      <View className="flex-row items-start justify-between gap-3">
                        <Txt className="text-[13px] text-ink-3">Address</Txt>
                        <Txt weight={500} className="flex-1 text-right text-[13px] text-ink">
                          {d.address}
                        </Txt>
                      </View>
                    ) : null}
                  </View>
                );
              })}
              <View className="flex-row items-start gap-2 rounded-lg bg-grey-100 px-3 py-2.5">
                <Info size={16} color={C.ink3} strokeWidth={2} style={{ marginTop: 1 }} />
                <Txt className="flex-1 text-[13px] leading-[18px] text-ink-3">
                  {ubos.length} beneficial owner{ubos.length > 1 ? 's' : ''} identified from the shareholding above.
                </Txt>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              <View className="flex-row items-start gap-2 rounded-lg bg-grey-100 px-3 py-2.5">
                <Info size={16} color={C.ink3} strokeWidth={2} style={{ marginTop: 1 }} />
                <Txt className="flex-1 text-[13px] leading-[18px] text-ink-3">
                  No individual holds more than {UBO_THRESHOLD}%. Under PMLA, name the senior managing official who
                  exercises control.
                </Txt>
              </View>
              <View className="gap-1.5">
                <FieldLabel required>Senior managing official</FieldLabel>
                <Dropdown value={seniorOfficial} options={directors} onChange={setSeniorOfficial} placeholder="Select a director" />
              </View>
            </View>
          )}
        </SectionCard>

        <Pressable onPress={() => setDeclared((p) => !p)} className="flex-row items-start gap-3 px-1">
          <View className="mt-0.5">
            <Checkbox checked={declared} />
          </View>
          <View className="flex-1 flex-row items-center gap-1.5">
            <UserCheck size={16} color={C.ink3} strokeWidth={2} />
            <Txt className="flex-1 text-[13px] leading-[18px] text-ink-2">
              The shareholding and beneficial-ownership details above are true and complete.
            </Txt>
          </View>
        </Pressable>
      </Body>

      <BottomBar
        hint={
          !totalOk ? (
            <Txt weight={500} className="text-[13px] text-amber-700">
              Shareholding must total 100% (currently {total}%)
            </Txt>
          ) : undefined
        }
      >
        <PrimaryCTA label="Confirm & continue" disabled={!complete} onPress={() => go('/self-declaration')} />
      </BottomBar>
    </View>
  );
}

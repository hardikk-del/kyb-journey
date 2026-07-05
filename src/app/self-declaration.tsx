import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Plus, Trash2, Check, Info } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Checkbox, Dropdown, RadioCard, SectionCard } from '@/components/kyb/controls';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type YN = 'yes' | 'no';

const inputCls = 'h-11 rounded-lg border border-line-strong bg-card px-3 text-[14px] text-ink';
const inputStyle = { fontFamily: 'DMSans_400Regular' };
const PH = 'rgb(141,141,141)';

const nfeCategories = [
  'Corporation regularly traded on a securities market',
  'Related entity of such a corporation',
  'Governmental Entity',
  'International Organisation',
  'Central Bank',
  'Financial Institution',
];

function YesNo({ value, onChange, invert }: { value: YN | null; onChange: (v: YN) => void; invert?: boolean }) {
  const order: YN[] = invert ? ['yes', 'no'] : ['no', 'yes'];
  return (
    <View className="w-[132px] flex-row gap-1 rounded-lg bg-grey-100 p-1">
      {order.map((v) => {
        const active = value === v;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            className={cn('h-9 flex-1 items-center justify-center rounded-md', active ? 'bg-card' : '')}
          >
            <Txt weight={600} className={cn('text-[14px] capitalize', active ? 'text-ink' : 'text-ink-3')}>
              {v}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function QRow({ title, sub, value, onChange, invert, last }: { title: string; sub?: string; value: YN | null; onChange: (v: YN) => void; invert?: boolean; last?: boolean }) {
  return (
    <View className={cn('flex-row items-center gap-3 py-3.5', last ? '' : 'border-b border-line')}>
      <View className="flex-1">
        <Txt weight={600} className="text-[15px] leading-[20px] text-ink">
          {title}
        </Txt>
        {sub ? <Txt className="mt-0.5 text-[13px] text-ink-3">{sub}</Txt> : null}
      </View>
      <YesNo value={value} onChange={onChange} invert={invert} />
    </View>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <View className="flex-1 gap-1.5">
      <Txt weight={500} className="text-[13px] text-ink-2">
        {label}
      </Txt>
      <TextInput placeholder={placeholder} placeholderTextColor={PH} style={inputStyle} className={inputCls} />
    </View>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return <View className="mt-3 gap-3 border-l-2 border-blue-100 pl-3">{children}</View>;
}

function Note({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <View className={cn('flex-row items-start gap-2 rounded-lg px-3 py-2.5', error ? 'border border-red-500 bg-card' : 'bg-grey-100')}>
      <Info size={16} color={error ? C.neg : C.ink3} strokeWidth={2} style={{ marginTop: 1 }} />
      <Txt className={cn('flex-1 text-[13px] leading-[18px]', error ? 'text-red-500' : 'text-ink-3')}>{children}</Txt>
    </View>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-3 py-2.5">
      <Checkbox checked={checked} />
      <Txt className="flex-1 text-[14px] leading-[19px] text-ink">{label}</Txt>
    </Pressable>
  );
}

export default function SelfDeclarationScreen() {
  const [indiaOnly, setIndiaOnly] = useState<YN>('yes');
  const [usResident, setUsResident] = useState<YN | null>(null);
  const [usPerson, setUsPerson] = useState<YN | null>(null);
  const [specifiedUs, setSpecifiedUs] = useState<YN | null>(null);
  const [otherResident, setOtherResident] = useState<YN | null>(null);
  const [cats, setCats] = useState<boolean[]>(Array(nfeCategories.length).fill(false));
  const [noTaxRes, setNoTaxRes] = useState<YN | null>(null);
  const [multiRes, setMultiRes] = useState<YN | null>(null);
  const [residencies, setResidencies] = useState<number[]>([0]);
  const [exposure, setExposure] = useState<'lt5' | 'ge5' | 'exempt'>('lt5');
  const [fiNfe, setFiNfe] = useState<'fi' | 'nfe'>('nfe');
  const [nfeType, setNfeType] = useState<'active' | 'passive'>('active');
  const [authorised, setAuthorised] = useState(true);
  const [bureauConsent, setBureauConsent] = useState(true);

  const fatcaExpanded = indiaOnly === 'no';
  const anyCat = cats.some(Boolean);
  const fatcaAnswered = usResident !== null && otherResident !== null && noTaxRes !== null && multiRes !== null;
  const contradiction = fatcaAnswered && usResident === 'no' && otherResident === 'no' && noTaxRes === 'no' && multiRes === 'no';
  const fatcaComplete = indiaOnly === 'yes' || (fatcaAnswered && !contradiction);

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('declaration')} title="Self-declaration" />

      <Body className="gap-5">
        {/* 1 — FATCA / CRS */}
        <SectionCard index={1} title="FATCA / CRS" hint="Tax residency declaration" required>
          <QRow title="Tax resident of India only?" sub="Not a tax resident of any country outside India" value={indiaOnly} onChange={setIndiaOnly} invert last />

          {fatcaExpanded ? (
            <View className="mt-2 gap-3">
              <Note error={contradiction}>
                {contradiction
                  ? 'Entity is not India-only — at least one residency outside India must be answered Yes.'
                  : 'Entity is not India-only. Answer each question to declare residencies outside India.'}
              </Note>

              <View>
                {/* US */}
                <View className="border-b border-line py-1">
                  <QRow title="Tax resident of the US?" value={usResident} onChange={setUsResident} last />
                  {usResident === 'yes' ? (
                    <Reveal>
                      <Field label="US TIN" placeholder="Enter US Taxpayer ID Number" />
                      <QRow title="Is the entity a US Person?" value={usPerson} onChange={setUsPerson} last />
                      <QRow title="Is it a Specified US Person?" sub="If yes, entity is US Reportable" value={specifiedUs} onChange={setSpecifiedUs} last />
                    </Reveal>
                  ) : null}
                </View>

                {/* Other than US */}
                <View className="border-b border-line py-1">
                  <QRow title="Tax resident outside India (other than US)?" value={otherResident} onChange={setOtherResident} last />
                  {otherResident === 'yes' ? (
                    <Reveal>
                      <View className="flex-row gap-3">
                        <Field label="Country code" placeholder="e.g. AE" />
                        <Field label="TIN / equivalent" placeholder="Tax ID" />
                      </View>
                      <View>
                        <Txt weight={500} className="mb-1 text-[13px] text-ink-2">
                          Entity category
                        </Txt>
                        {nfeCategories.map((c, i) => (
                          <CheckRow key={c} label={c} checked={cats[i]} onToggle={() => setCats((p) => p.map((v, idx) => (idx === i ? !v : v)))} />
                        ))}
                        {!anyCat ? <Note>If none apply, the account is classified as an "Other Reportable Account".</Note> : null}
                      </View>
                    </Reveal>
                  ) : null}
                </View>

                {/* No tax residence */}
                <View className="border-b border-line py-1">
                  <QRow title="No residence for tax purposes?" value={noTaxRes} onChange={setNoTaxRes} last />
                  {noTaxRes === 'yes' ? (
                    <Reveal>
                      <Field label="Country code of principal office" placeholder="e.g. SG" />
                    </Reveal>
                  ) : null}
                </View>

                {/* Multiple residencies */}
                <View className="py-1">
                  <QRow title="Multiple tax residencies?" value={multiRes} onChange={setMultiRes} last />
                  {multiRes === 'yes' ? (
                    <Reveal>
                      {residencies.map((id, idx) => (
                        <View key={id} className="gap-3 rounded-lg border border-line bg-grey-100 p-3">
                          <View className="flex-row items-center justify-between">
                            <Txt weight={600} className="text-[12px] uppercase tracking-[0.5px] text-ink-3">
                              Residency {idx + 1}
                            </Txt>
                            {residencies.length > 1 ? (
                              <Pressable onPress={() => setResidencies((p) => p.filter((x) => x !== id))} hitSlop={6}>
                                <Trash2 size={16} color={C.neg} strokeWidth={2} />
                              </Pressable>
                            ) : null}
                          </View>
                          <View className="flex-row gap-3">
                            <Field label="Country of tax residence" placeholder="Country" />
                            <Field label="TIN / equivalent" placeholder="Tax ID" />
                          </View>
                          <View className="gap-1.5">
                            <Txt weight={500} className="text-[13px] text-ink-2">
                              Identification type
                            </Txt>
                            <Dropdown value="TIN" options={['TIN', 'CIN', 'EIN', 'Other']} onChange={() => {}} />
                          </View>
                          <Field label="Address" placeholder="Registered address" />
                        </View>
                      ))}
                      <Pressable
                        onPress={() => setResidencies((p) => [...p, (p[p.length - 1] ?? 0) + 1])}
                        className="h-9 flex-row items-center gap-1.5 self-start rounded-md border border-line bg-card px-3 active:bg-grey-50"
                      >
                        <Plus size={16} color={C.ink} strokeWidth={2} />
                        <Txt weight={600} className="text-[13px] text-ink">
                          Add residency
                        </Txt>
                      </Pressable>
                    </Reveal>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}
        </SectionCard>

        {/* 2 — Credit exposure */}
        <SectionCard index={2} title="Credit exposure" hint="Total exposure across the banking system" required>
          <View className="gap-2.5">
            <RadioCard label="Less than ₹5 Crores" checked={exposure === 'lt5'} onSelect={() => setExposure('lt5')} />
            <RadioCard label="₹5 Crores or more" checked={exposure === 'ge5'} onSelect={() => setExposure('ge5')} />
            <RadioCard label="Exempted category" checked={exposure === 'exempt'} onSelect={() => setExposure('exempt')} />
          </View>
          {exposure === 'lt5' ? (
            <View className="mt-3 rounded-lg bg-grey-100 px-3.5 py-3">
              <Txt weight={600} className="text-[11px] uppercase tracking-[0.5px] text-ink-3">
                Undertaking
              </Txt>
              <Txt className="mt-1.5 text-[12.5px] leading-[19px] text-ink-2">
                I/We declare that our total credit exposure with all Banks is less than ₹5.00 crores. I/We undertake to
                inform the Bank immediately of any change to our CC/OD/credit facilities, or when total facilities reach
                ₹5.00 crores or more, to provide documents required under RBI regulations, and to close the Current
                Account as and when demanded by the Bank.
              </Txt>
            </View>
          ) : null}
        </SectionCard>

        {/* 3 — FI / NFE */}
        <SectionCard index={3} title="FI / NFE classification" hint="Financial vs non-financial entity" required>
          <View className="gap-2.5">
            <RadioCard label="Financial Institution (FI)" sub="Banks, insurance, NBFCs, etc." checked={fiNfe === 'fi'} onSelect={() => setFiNfe('fi')} />
            <RadioCard label="Non-Financial Entity (NFE)" checked={fiNfe === 'nfe'} onSelect={() => setFiNfe('nfe')} />
          </View>
          {fiNfe === 'nfe' ? (
            <Reveal>
              <Txt weight={500} className="text-[13px] text-ink-2">
                Is the entity an Active or Passive NFE?
              </Txt>
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <RadioCard label="Active NFE" checked={nfeType === 'active'} onSelect={() => setNfeType('active')} />
                </View>
                <View className="flex-1">
                  <RadioCard label="Passive NFE" checked={nfeType === 'passive'} onSelect={() => setNfeType('passive')} />
                </View>
              </View>
              {nfeType === 'passive' ? (
                <Note>Declare the number of Controlling Persons and complete their details in the next section.</Note>
              ) : null}
            </Reveal>
          ) : null}
        </SectionCard>

        {/* Authorisation */}
        <View className="gap-3.5">
          <Pressable onPress={() => setAuthorised((p) => !p)} className="flex-row items-start gap-3 px-1">
            <View className="mt-0.5">
              <Checkbox checked={authorised} />
            </View>
            <Txt className="flex-1 text-[13px] leading-[18px] text-ink-2">
              Customer declares the above is true and authorises the bank to verify with tax authorities and the banking
              system.
            </Txt>
          </Pressable>
          <Pressable onPress={() => setBureauConsent((p) => !p)} className="flex-row items-start gap-3 px-1">
            <View className="mt-0.5">
              <Checkbox checked={bureauConsent} />
            </View>
            <Txt className="flex-1 text-[13px] leading-[18px] text-ink-2">
              Customer consents to the bank fetching credit information from credit bureaus to assess total credit
              exposure, evaluate risk, and recommend eligible banking products.
            </Txt>
          </Pressable>
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA
          label="Run verification"
          trailing={false}
          disabled={!authorised || !bureauConsent || !fatcaComplete}
          onPress={() => go('/business-details')}
        />
      </BottomBar>
    </View>
  );
}

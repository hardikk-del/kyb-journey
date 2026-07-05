import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Building2, Flag } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Dropdown, FieldLabel, SectionCard, Segmented } from '@/components/kyb/controls';
import { StatusBadge } from '@/components/kyb/docs';
import { useFlow } from '@/store/flow';
import { ENTITY_META, authorisedSignatoriesFor, membersFor } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const turnoverBands = ['₹0–5 L', '₹5–10 L', '₹10–50 L', '₹50 L–1 Cr', '₹1–10 Cr', '₹10–50 Cr', '₹50–100 Cr', '> ₹100 Cr'];
const natures = ['Manufacturer', 'Trader / Wholesaler', 'Retailer', 'Service provider', 'Others'];
const fundSources = ['Business income', 'Donation', 'Grant', 'From group company', 'Equity investment', 'Other'];

const inputCls = 'rounded-lg border border-line-strong bg-card px-3 text-[14px] text-ink';
const PH = 'rgb(141,141,141)';
const inputStyle = { fontFamily: 'DMSans_400Regular' as const };

export default function BusinessDetailsScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const isLtd = entity === 'ltd';
  const isCorporate = entity === 'llp' || isLtd;
  const members = flow.members.length ? flow.members : membersFor(entity);
  const authorisedNames = authorisedSignatoriesFor(entity);

  const [turnover, setTurnover] = useState('');
  const [channel, setChannel] = useState<'online' | 'offline' | 'both' | null>(null);
  const [nature, setNature] = useState('');
  const [funds, setFunds] = useState('');

  const complete = turnover && channel && nature && funds;
  const entityName = ENTITY_META[entity]?.legalName ?? 'Mehta Textiles Pvt Ltd';
  const memberNoun = ENTITY_META[entity]?.memberNoun ?? 'Members';

  const baseFields = [
    { label: 'Entity name', value: entityName },
    { label: 'Date of incorporation', value: '14 Mar 2016' },
    { label: 'Registered address', value: 'Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059' },
  ];

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('business')} title="Business details" />

      <Body className="gap-5">
        {/* auto-fetched entity card */}
        <View style={shadowXs} className="overflow-hidden rounded-xl border border-green-300 bg-card">
          <View className="flex-row items-center gap-3 border-b border-line bg-green-50 px-4 py-3.5">
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-card">
              <Building2 size={20} color={C.posFg} strokeWidth={1.75} />
            </View>
            <Txt weight={700} className="flex-1 text-[14px] text-ink">
              Entity details
            </Txt>
            <StatusBadge kind="verified" />
          </View>

          <View className="px-4 py-1">
            {isCorporate ? (
              <View className="gap-0.5 border-b border-line py-3">
                <Txt weight={500} className="text-[12px] text-ink-3">
                  {memberNoun}
                </Txt>
                <View className="mt-1 gap-1">
                  {members.map((p, i) => (
                    <Txt key={p} weight={600} className="text-[14px] leading-[19px] text-ink">
                      {i + 1}. {p}
                      {isLtd && authorisedNames.includes(p) ? (
                        <Txt weight={500} className="text-[12px] text-brand">
                          {'  '}· Authorised signatory
                        </Txt>
                      ) : null}
                    </Txt>
                  ))}
                </View>
              </View>
            ) : (
              <View className="gap-0.5 border-b border-line py-3">
                <Txt weight={500} className="text-[12px] text-ink-3">
                  Proprietor name
                </Txt>
                <Txt weight={600} className="text-[14px] text-ink">
                  Rahul Mehta
                </Txt>
              </View>
            )}

            {baseFields.map((f, i) => (
              <View key={f.label} className={cn('gap-0.5 py-3', i === baseFields.length - 1 ? '' : 'border-b border-line')}>
                <Txt weight={500} className="text-[12px] text-ink-3">
                  {f.label}
                </Txt>
                <Txt weight={600} className="text-[14px] leading-[19px] text-ink">
                  {f.value}
                </Txt>
              </View>
            ))}
          </View>

          <View className="flex-row justify-end border-t border-line px-4 py-2.5">
            <Pressable className="flex-row items-center gap-1.5">
              <Flag size={14} color={C.ink3} strokeWidth={2} />
              <Txt weight={600} className="text-[13px] text-ink-3">
                Report mismatch
              </Txt>
            </Pressable>
          </View>
        </View>

        <SectionCard index={1} title="Annual turnover" hint="Latest financial year" required>
          <Dropdown value={turnover} options={turnoverBands} onChange={setTurnover} placeholder="Select turnover band" />
        </SectionCard>

        <SectionCard index={2} title="What the business does" required>
          <View className="gap-4">
            <View className="gap-1.5">
              <FieldLabel required>What does the business sell or provide?</FieldLabel>
              <TextInput
                placeholder="e.g. Wholesale cotton fabric and finished garments to apparel brands"
                placeholderTextColor={PH}
                multiline
                style={[inputStyle, { minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }]}
                className={inputCls}
              />
            </View>
            <View className="gap-1.5">
              <FieldLabel required>Who are the customers?</FieldLabel>
              <TextInput placeholder="e.g. Apparel brands and garment manufacturers" placeholderTextColor={PH} style={[inputStyle, { height: 44 }]} className={inputCls} />
            </View>
            <View className="gap-2">
              <FieldLabel required>Sales channel</FieldLabel>
              <Segmented
                value={channel}
                onChange={setChannel}
                options={[
                  { value: 'online', label: 'Online' },
                  { value: 'offline', label: 'Offline' },
                  { value: 'both', label: 'Both' },
                ]}
              />
            </View>
            <View className="gap-1.5">
              <FieldLabel>Primary revenue line</FieldLabel>
              <TextInput placeholder="e.g. Fabric wholesale (≈70% of revenue)" placeholderTextColor={PH} style={[inputStyle, { height: 44 }]} className={inputCls} />
            </View>
          </View>
        </SectionCard>

        <SectionCard index={3} title="Nature of business" required>
          <View className="gap-2.5">
            <Dropdown value={nature} options={natures} onChange={setNature} placeholder="Select nature of business" />
            {nature === 'Others' ? (
              <TextInput placeholder="Specify nature of business" placeholderTextColor={PH} style={[inputStyle, { height: 44 }]} className={inputCls} />
            ) : null}
          </View>
        </SectionCard>

        <SectionCard index={4} title="Source of funds" required>
          <View className="gap-2.5">
            <Dropdown value={funds} options={fundSources} onChange={setFunds} placeholder="Select source of funds" />
            {funds === 'Other' ? (
              <TextInput placeholder="Specify other source of funds" placeholderTextColor={PH} style={[inputStyle, { height: 44 }]} className={inputCls} />
            ) : null}
          </View>
        </SectionCard>
      </Body>

      <BottomBar>
        <PrimaryCTA label="Continue to verification" trailing={false} disabled={!complete} onPress={() => go('/site-verification')} />
      </BottomBar>
    </View>
  );
}

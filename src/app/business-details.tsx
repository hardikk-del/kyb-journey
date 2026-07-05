import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Dropdown, FieldLabel, SectionCard, Segmented } from '@/components/kyb/controls';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';

const turnoverBands = ['₹0–5 L', '₹5–10 L', '₹10–50 L', '₹50 L–1 Cr', '₹1–10 Cr', '₹10–50 Cr', '₹50–100 Cr', '> ₹100 Cr'];
const natures = ['Manufacturer', 'Trader / Wholesaler', 'Retailer', 'Service provider', 'Others'];
const fundSources = ['Business income', 'Donation', 'Grant', 'From group company', 'Equity investment', 'Other'];

const inputCls = 'rounded-lg border border-line-strong bg-card px-3 text-[14px] text-ink';
const PH = 'rgb(141,141,141)';
const inputStyle = { fontFamily: 'DMSans_500Medium' as const };

export default function BusinessDetailsScreen() {
  const flow = useFlow();
  const isLtd = flow.entity === 'ltd';

  const [turnover, setTurnover] = useState('');
  const [channel, setChannel] = useState<'online' | 'offline' | 'both' | null>(null);
  const [nature, setNature] = useState('');
  const [funds, setFunds] = useState('');

  const complete = turnover && channel && nature && funds;

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('business')} title="Business details" />

      <Body className="gap-5">
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
              <TextInput placeholder="e.g. Apparel brands and garment manufacturers" 
              placeholderTextColor={PH} 
              style={[inputStyle, { height: 44 }]} 
              className={inputCls} />
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
        <PrimaryCTA
          label={isLtd ? 'Continue to documents' : 'Continue to verification'}
          trailing={false}
          disabled={!complete}
          onPress={() => go(isLtd ? '/business-doc-incorporation' : '/site-verification')}
        />
      </BottomBar>
    </View>
  );
}

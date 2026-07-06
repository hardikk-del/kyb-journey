import { BadgeCheck, Landmark } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Input } from '@/components/Input';
import { Txt } from '@/components/Txt';
import { Dropdown, FieldLabel } from '@/components/kyb/controls';
import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { ENTITY_META, isCorporateEntity, membersFor } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { useFlow } from '@/store/flow';

const HAS_CIN: Record<string, boolean> = { ltd: true, llp: true };

const STATES: { name: string; code: string }[] = [
  { name: 'Andhra Pradesh', code: '37' }, { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' }, { name: 'Bihar', code: '10' }, { name: 'Chhattisgarh', code: '22' },
  { name: 'Goa', code: '30' }, { name: 'Gujarat', code: '24' }, { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' }, { name: 'Jharkhand', code: '20' }, { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' }, { name: 'Madhya Pradesh', code: '23' }, { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' }, { name: 'Meghalaya', code: '17' }, { name: 'Mizoram', code: '15' },
  { name: 'Nagaland', code: '13' }, { name: 'Odisha', code: '21' }, { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' }, { name: 'Sikkim', code: '11' }, { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' }, { name: 'Tripura', code: '16' }, { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' }, { name: 'West Bengal', code: '19' },
  { name: 'Andaman & Nicobar Islands', code: '35' }, { name: 'Chandigarh', code: '04' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', code: '26' }, { name: 'Delhi', code: '07' },
  { name: 'Jammu & Kashmir', code: '01' }, { name: 'Ladakh', code: '38' },
  { name: 'Lakshadweep', code: '31' }, { name: 'Puducherry', code: '34' },
];

function Detail({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between gap-4 ${last ? '' : 'border-b border-line pb-3'}`}>
      <Txt className="text-[13px] text-ink-3">{label}</Txt>
      <Txt weight={700} className="flex-1 text-right text-[14px] tracking-[0.3px] text-ink">
        {value}
      </Txt>
    </View>
  );
}

export default function EntityDetailsScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const isLlp = entity === 'llp';
  const isCorporate = isCorporateEntity(entity);
  const meta = ENTITY_META[entity];
  const members = meta?.members ?? membersFor(entity);

  const [pan, setPan] = useState('');
  const [state, setState] = useState('');
  const [stage, setStage] = useState<'input' | 'verifying' | 'verified'>('input');

  // Canonical PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const panError = pan.length === 10 && !panValid;
  const locked = stage !== 'input';
  const stateCode = STATES.find((s) => s.name === state)?.code ?? '29';
  const gstin = `${stateCode}${pan}1ZO`;
  const cin = meta?.cin ?? 'U23941GJ2016PTC181035';
  const verifiedName = meta?.legalName ?? 'Shri Shakti Properties and BMS';
  const verified = stage === 'verified';

  const runVerify = () => {
    setStage('verifying');
    setTimeout(() => setStage('verified'), 1600);
  };

  const next = () => {
    flow.set({ entity, members });
    if (isLlp) go('/partner-contacts');
    else if (entity === 'ltd') {
      flow.set({ signatory: members[0] });
      go('/ownership');
    } else go('/checklist');
  };

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('entity')} title="Business details" />

      <Body>
        <Txt className="-mt-1 text-[14px] leading-[21px] text-ink-2">
          Enter the entity details as per the business PAN.
        </Txt>

        <View>
          <Input
            label="Business PAN"
            required
            value={pan}
            editable={!locked}
            mono
            autoCapitalize="characters"
            maxLength={10}
            placeholder="ABCDE1234F"
            onChangeText={(t) => setPan(t.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10))}
          />
          {panError ? (
            <Txt className="mt-1.5 text-[12px] text-red-500">Enter a valid PAN (e.g. ABCDE1234F).</Txt>
          ) : null}
        </View>

        <View className="gap-2">
          <FieldLabel required>State / UT to open current account</FieldLabel>
          <Dropdown
            value={state}
            options={STATES.map((s) => s.name)}
            onChange={setState}
            placeholder="Select State / UT"
            disabled={locked}
          />
          <Txt className="text-[12.5px] leading-[17px] text-ink-3">
            The current account will be opened against the GSTIN registered in this State / UT.
          </Txt>
        </View>

        {stage === 'verifying' ? (
          <View style={shadowXs} className="items-center justify-center gap-3 rounded-xl border border-line bg-card py-9">
            <ActivityIndicator size="large" color={C.brand} />
            <Txt weight={600} className="text-[14px] text-ink">
              {isCorporate ? 'Fetching details from MCA...' : 'Verifying PAN'}
            </Txt>
          </View>
        ) : null}

        {verified ? (
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <BadgeCheck size={18} color={C.posFg} strokeWidth={2} />
              <Txt className="flex-1 text-[13.5px] text-ink-2">
                Successfully verified PAN for <Txt weight={700} className="text-ink">{verifiedName}</Txt>
              </Txt>
            </View>

            <View style={shadowXs} className="gap-4 rounded-xl border border-line bg-card p-4">
              <View className="flex-row items-start gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Landmark size={18} color={C.brand} strokeWidth={2} />
                </View>
                <Txt className="flex-1 text-[13px] leading-[18px] text-ink-2">
                  We'll use the details below to complete KYC for{' '}
                  <Txt weight={600} className="text-ink">{verifiedName}</Txt>.
                </Txt>
              </View>

              <View className="gap-3 pt-1">
                <Detail label="GST Number" value={gstin} />
                {HAS_CIN[entity] ? <Detail label="CIN Number" value={cin} /> : null}
                <Detail label="State / UT" value={state} last />
              </View>
            </View>

            <Txt className="text-[12px] leading-[17px] text-ink-3">
              By tapping Next, you consent to fetching these details from Central KYC for faster verification.
            </Txt>
          </View>
        ) : null}
      </Body>

      <BottomBar>
        {verified ? (
          <PrimaryCTA label="Next" onPress={next} />
        ) : (
          <PrimaryCTA
            label={stage === 'verifying' ? (isCorporate ? 'Fetching MCA Records…' : 'Verifying PAN…') : 'Verify PAN'}
            trailing={false}
            disabled={!panValid || !state || stage === 'verifying'}
            onPress={runVerify}
          />
        )}
      </BottomBar>
    </View>
  );
}

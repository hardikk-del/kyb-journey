import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PenLine, Check, RotateCcw } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Checkbox, Dropdown, Eyebrow, FieldLabel } from '@/components/kyb/controls';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type SigStatus = 'idle' | 'uploading' | 'done';
const RELATIONSHIPS = ['Spouse / Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];
const SIG_PATH =
  'M8 44 C 26 8, 38 8, 40 36 C 41 50, 30 52, 34 40 C 40 22, 56 18, 60 40 C 62 52, 76 50, 84 30 C 92 12, 104 14, 100 40 L 112 22 C 118 40, 126 42, 138 26 C 150 12, 158 22, 156 38 C 170 20, 188 18, 196 38 C 200 48, 214 44, 232 24';
const inputCls = 'h-12 rounded-lg border border-line-strong bg-card px-3.5 text-[14px] text-ink';
const PH = 'rgb(141,141,141)';
const inputStyle = { fontFamily: 'DMSans_400Regular' as const };

function SignatureMark() {
  return (
    <Svg width={220} height={56} viewBox="0 0 240 64">
      <Path d={SIG_PATH} fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SignatureNomineeScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const isLtd = entity === 'ltd';
  const isCorporate = entity === 'llp' || isLtd;
  const authorisedSignatory = flow.signatory || flow.members[0];
  const signatoryRole = isLtd ? 'director' : 'designated partner';

  const [sig, setSig] = useState<SigStatus>('idle');
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [relationshipOther, setRelationshipOther] = useState('');
  const [share, setShare] = useState('100');
  const [address, setAddress] = useState('');
  const [attested, setAttested] = useState(true);

  const uploadSig = () => {
    setSig('uploading');
    setTimeout(() => setSig('done'), 900);
  };
  const canContinue = sig === 'done' && attested;

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('signature')} title="Signature & nominee" />

      <Body className="gap-7">
        {/* RM attestation */}
        <Pressable onPress={() => setAttested((p) => !p)} style={shadowXs} className="flex-row items-start gap-3 rounded-xl border border-line bg-card p-4">
          <View className="mt-0.5">
            <Checkbox checked={attested} />
          </View>
          <View className="flex-1 gap-1">
            <Txt weight={700} className="text-[14px] text-ink">
              RM declaration & attestation
            </Txt>
            <Txt className="text-[12.5px] leading-[18px] text-ink-2">
              I, RM Anita Desai (EMP-20481), confirm I conducted this onboarding and verified the originals.
            </Txt>
          </View>
        </Pressable>

        {/* Signature */}
        <View className="gap-2.5">
          <Eyebrow>{isCorporate ? 'Authorised signatory signature' : 'Customer signature'}<Txt className="text-red-500"> *</Txt></Eyebrow>
          <Txt className="-mt-0.5 text-[13px] leading-[18px] text-ink-3">
            {isCorporate
              ? `Capture or upload the signature of ${authorisedSignatory}, the ${signatoryRole} authorised to operate this account. This will be applied to the account opening form.`
              : "Capture or upload the customer's signature. This will be applied to the account opening form."}
          </Txt>

          {sig === 'idle' ? (
            <Pressable onPress={uploadSig} className="h-[140px] items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line active:bg-grey-50">
              <PenLine size={24} color={C.ink3} strokeWidth={1.75} />
              <Txt weight={600} className="text-[13px] text-ink">
                Capture or upload signature
              </Txt>
              <Txt className="text-[11px] text-ink-3">JPG / PNG / PDF · on white paper</Txt>
            </Pressable>
          ) : sig === 'uploading' ? (
            <View className="h-[140px] items-center justify-center gap-2 rounded-xl border border-line bg-grey-100">
              <ActivityIndicator color={C.brand} />
              <Txt weight={500} className="text-[13px] text-ink-2">
                Uploading…
              </Txt>
            </View>
          ) : (
            <View>
              <View style={shadowXs} className="overflow-hidden rounded-xl border border-green-300 bg-card">
                <View className="flex-row items-center justify-between border-b border-line px-3.5 py-2.5">
                  <Txt weight={600} className="text-[13px] text-ink">
                    {isCorporate ? `${authorisedSignatory}_signature.png` : 'signature.png'}
                  </Txt>
                  <View className="flex-row items-center gap-1">
                    <Check size={14} color={C.posFg} strokeWidth={2.5} />
                    <Txt weight={600} className="text-[12px] text-green-700">
                      Captured
                    </Txt>
                  </View>
                </View>
                <View className="h-[96px] items-center justify-center bg-grey-100">
                  <SignatureMark />
                </View>
              </View>
              <Pressable onPress={uploadSig} className="mt-2 h-9 flex-row items-center gap-1.5 self-start rounded-md border border-line bg-card px-3 active:bg-grey-50">
                <RotateCcw size={16} color={C.ink} strokeWidth={2} />
                <Txt weight={600} className="text-[13px] text-ink">
                  Re-upload
                </Txt>
              </Pressable>
            </View>
          )}
        </View>

        {/* Nominee */}
        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <Eyebrow>Nominee details</Eyebrow>
            <View className="rounded bg-grey-100 px-1.5 py-0.5">
              <Txt weight={700} className="text-[10px] tracking-[0.3px] text-ink-3">
                OPTIONAL
              </Txt>
            </View>
          </View>

          <View className="gap-1.5">
            <FieldLabel>Nominee's full name</FieldLabel>
            <TextInput value={name} onChangeText={setName} placeholder="As per the nominee's ID" placeholderTextColor={PH} style={inputStyle} className={inputCls} />
          </View>

          <View className="gap-1.5">
            <FieldLabel>Relationship with nominee</FieldLabel>
            <Dropdown value={relationship} options={RELATIONSHIPS} onChange={setRelationship} placeholder="Select relationship" />
            {relationship === 'Other' ? (
              <TextInput value={relationshipOther} onChangeText={setRelationshipOther} placeholder="Specify relationship" placeholderTextColor={PH} style={inputStyle} className={cn(inputCls, 'mt-1')} />
            ) : null}
          </View>

          <View className="gap-1.5">
            <FieldLabel>Share percentage</FieldLabel>
            <View className="h-12 flex-row items-center rounded-lg border border-line-strong bg-card px-3.5">
              <TextInput
                value={share}
                onChangeText={(t) => setShare(t.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="100"
                placeholderTextColor={PH}
                style={inputStyle}
                className="flex-1 text-[14px] text-ink"
              />
              <Txt weight={600} className="text-[14px] text-ink-3">
                %
              </Txt>
            </View>
          </View>

          <View className="gap-1.5">
            <FieldLabel>Nominee's address</FieldLabel>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="House / flat, street, city, state and PIN"
              placeholderTextColor={PH}
              multiline
              style={[inputStyle, { minHeight: 88, textAlignVertical: 'top', paddingTop: 12 }]}
              className="rounded-lg border border-line-strong bg-card px-3.5 text-[14px] leading-[19px] text-ink"
            />
          </View>
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA label="Continue" trailing={false} disabled={!canContinue} onPress={() => go('/aof-esign')} />
      </BottomBar>
    </View>
  );
}

import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { User } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Req } from '@/components/kyb/controls';
import { FlagIN } from '@/components/glyphs';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';

export default function PartnerContactsScreen() {
  const flow = useFlow();
  const partners = flow.members;

  const [phones, setPhones] = useState<Record<string, string>>(() =>
    partners.reduce((acc, p) => ({ ...acc, [p]: p === 'Ravi Kumar' ? '7606512345' : '' }), {}),
  );
  const setPhone = (p: string, val: string) => setPhones((prev) => ({ ...prev, [p]: val.replace(/\D/g, '').slice(0, 10) }));
  const ready = partners.every((p) => phones[p]?.length === 10);

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('partners')} title="Partner contacts" />

      <Body>
        <View className="gap-1.5">
          <Txt weight={600} className="text-[17px] tracking-[-0.2px] text-ink">
            Provide contact details for secure link dispatch
          </Txt>
          <Txt className="text-[14px] leading-[19px] text-ink-3">
            Each Designated Partner will receive an automated document collection and biometric verification link via
            WhatsApp & SMS.
          </Txt>
        </View>

        <View className="gap-5">
          {partners.map((partner) => (
            <View key={partner} style={shadowXs} className="gap-2 rounded-xl border border-line bg-card p-4">
              <View className="flex-row items-center gap-2">
                <User size={16} color={C.brand} strokeWidth={2.5} />
                <Txt weight={700} className="text-[14px] text-ink">
                  {partner}'s Mobile Number
                  <Req />
                </Txt>
              </View>
              <View className="mt-1 h-14 flex-row items-center gap-2.5 rounded-xl border border-line bg-card px-3.5">
                <FlagIN w={24} />
                <Txt weight={600} className="text-[15px] text-ink">
                  +91
                </Txt>
                <TextInput
                  value={phones[partner] ?? ''}
                  onChangeText={(t) => setPhone(partner, t)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="rgb(141, 141, 141)"
                  style={{ fontFamily: 'DMSans_500Medium', letterSpacing: 1 }}
                  className="flex-1 text-[15px] text-ink"
                />
              </View>
            </View>
          ))}
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA
          label="Dispatch Verification Links"
          disabled={!ready}
          onPress={() => go('/partner-tracking')}
        />
      </BottomBar>
    </View>
  );
}

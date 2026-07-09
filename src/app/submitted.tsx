import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Home, CalendarClock, Dot } from 'lucide-react-native';

import { BottomBar } from '@/components/layout';
import { Button } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { useFlow } from '@/store/flow';
import { ENTITY_META } from '@/lib/entities';
import { C } from '@/lib/tokens';

export default function SubmittedScreen() {
  const flow = useFlow();
  const legalName = ENTITY_META[flow.entity]?.legalName ?? 'Kirana Traders';
  const pending = flow.deferredDocs;

  return (
    <View className="flex-1 bg-page">
      <View className="flex-1 items-center justify-center px-5">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-green-700">
            <Check size={32} color="#fff" strokeWidth={3} />
          </View>
        </View>
        <Txt weight={700} className="mt-6 text-[24px] tracking-[-0.4px] text-ink">
          Application submitted
        </Txt>
        <Txt className="mt-2 max-w-[300px] text-center text-[14px] leading-[20px] text-ink-2">
          The current account application for <Txt weight={600} className="text-ink">{legalName}</Txt> has been submitted
          successfully.
        </Txt>

        {pending.length ? (
          <View className="mt-6 w-full max-w-[360px] rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5">
            <View className="flex-row items-center gap-2">
              <CalendarClock size={16} color={C.amberFg} strokeWidth={2} />
              <Txt weight={600} className="flex-1 text-[13.5px] text-amber-700">
                {pending.length} document{pending.length > 1 ? 's' : ''} to be collected
              </Txt>
            </View>
            <Txt className="mt-1.5 text-[12.5px] leading-[17px] text-amber-700">
              Our agent will reach out on WhatsApp within 7 days to collect:
            </Txt>
            <View className="mt-2 gap-0.5">
              {pending.map((doc) => (
                <View key={doc} className="flex-row items-center">
                  <Dot size={18} color={C.amberFg} strokeWidth={3} />
                  <Txt weight={500} className="flex-1 text-[13px] text-amber-700">
                    {doc}
                  </Txt>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <BottomBar>
        <Button
          label="Back to home"
          fullWidth
          leadingIcon={<Home size={18} color="#fff" />}
          onPress={() => {
            flow.reset();
            router.replace('/');
          }}
        />
      </BottomBar>
    </View>
  );
}

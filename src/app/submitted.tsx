import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Home } from 'lucide-react-native';

import { BottomBar } from '@/components/layout';
import { Button } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { useFlow } from '@/store/flow';
import { ENTITY_META } from '@/lib/entities';

export default function SubmittedScreen() {
  const flow = useFlow();
  const legalName = ENTITY_META[flow.entity]?.legalName ?? 'Kirana Traders';

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

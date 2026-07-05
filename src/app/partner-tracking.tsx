import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { ProgressMeter } from '@/components/kyb/controls';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type TrackState = 'sent' | 'progress' | 'verified';

export default function PartnerTrackingScreen() {
  const flow = useFlow();
  const partners = flow.members;

  const [statuses, setStatuses] = useState<Record<string, TrackState>>(() =>
    partners.reduce((acc, p) => ({ ...acc, [p]: p === 'Ravi Kumar' ? 'verified' : 'sent' }), {}),
  );

  useEffect(() => {
    const t1 = setTimeout(() => setStatuses((prev) => ({ ...prev, [partners[1]]: 'progress' })), 4000);
    const t2 = setTimeout(() => setStatuses((prev) => ({ ...prev, [partners[1]]: 'verified' })), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [partners]);

  const verifiedCount = partners.filter((p) => statuses[p] === 'verified').length;
  const allClear = verifiedCount === partners.length;

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('partners')} title={allClear ? 'Verifications complete' : 'Awaiting partner KYC'} />

      <Body>
        <ProgressMeter done={verifiedCount} total={partners.length} verb="verified" />

        <View className="gap-3.5">
          {partners.map((partner) => {
            const st = statuses[partner];
            const border = st === 'verified' ? 'border-green-300' : st === 'progress' ? 'border-amber-500' : 'border-line';
            return (
              <View key={partner} style={shadowXs} className={cn('gap-3 rounded-xl border bg-card p-4', border)}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <View className={cn('h-2 w-2 rounded-full', st === 'verified' ? 'bg-green-500' : st === 'progress' ? 'bg-amber-500' : 'bg-ink-3')} />
                    <Txt weight={600} className="text-[16px] text-ink">
                      {partner}
                    </Txt>
                  </View>
                  {st === 'verified' ? (
                    <View className="h-6 flex-row items-center gap-1 rounded-full bg-green-50 px-2.5">
                      <CheckCircle2 size={14} color={C.posFg} />
                      <Txt weight={600} className="text-[12px] text-green-700">
                        Verified
                      </Txt>
                    </View>
                  ) : st === 'progress' ? (
                    <View className="h-6 flex-row items-center rounded-full bg-amber-50 px-2.5">
                      <Txt weight={600} className="text-[12px] text-amber-700">
                        Uploading Documents
                      </Txt>
                    </View>
                  ) : (
                    <View className="h-6 flex-row items-center rounded-full bg-grey-100 px-2.5">
                      <Txt weight={500} className="text-[12px] text-ink-3">
                        Link Delivered
                      </Txt>
                    </View>
                  )}
                </View>

                <View className="flex-row items-center gap-2 border-t border-line pt-2.5">
                  <MessageCircle size={16} color={C.pos} />
                  <Txt className="flex-1 text-[13px] text-ink-3">Secure gateway setup configured for active dispatch</Txt>
                </View>

                {st === 'progress' ? (
                  <View className="flex-row items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    <ShieldCheck size={14} color={C.brand} />
                    <Txt weight={500} className="flex-1 text-[12px] text-brand">
                      Customer is performing real-time Aadhaar Liveness match...
                    </Txt>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </Body>

      <BottomBar
        hint={
          !allClear ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={C.amberFg} />
              <Txt weight={500} className="text-[13px] text-amber-700">
                Waiting for {partners.length - verifiedCount} partner KYC...
              </Txt>
            </View>
          ) : undefined
        }
      >
        <PrimaryCTA
          label={allClear ? 'Proceed to Corporate Documents' : 'Waiting for remote inputs'}
          disabled={!allClear}
          onPress={() => go('/business-docs')}
        />
      </BottomBar>
    </View>
  );
}

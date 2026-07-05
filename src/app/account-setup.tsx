import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Check, ChevronDown, Sparkles } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowSm } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type Plan = { id: string; name: string; tagline: string; minBalance: string; features: string[]; recommended?: boolean };

const PLANS: Plan[] = [
  {
    id: 'digital-first',
    name: 'Digital First Account',
    tagline: 'Best fit for a high-volume digital business',
    minBalance: '₹35,000',
    recommended: true,
    features: [
      'Unlimited UPI & digital transactions',
      'Free payment gateway setup · 1% MDR discount',
      'Automated GST payments & bulk payouts',
      'High transaction limit · ₹5L per day',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Business Account',
    tagline: 'For businesses scaling cash + trade operations',
    minBalance: '₹50,000',
    features: [
      'Unlimited UPI & digital transactions',
      'Dedicated relationship manager',
      'Free cash deposit up to ₹10L / month',
      'Priority trade & forex desk',
    ],
  },
  {
    id: 'starter',
    name: 'Starter Current Account',
    tagline: 'Low balance commitment to begin with',
    minBalance: '₹10,000',
    features: ['UPI & digital transactions', 'Standard payout limit · ₹2L per day', 'Basic GST payment support'],
  },
];

export default function AccountSetupScreen() {
  const [selected, setSelected] = useState<string>(PLANS.find((p) => p.recommended)?.id ?? PLANS[0].id);
  const selectedPlan = PLANS.find((p) => p.id === selected);

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('account')} title="Account setup" />

      <Body className="gap-4">
        <Txt className="text-[14px] leading-[20px] text-ink-2">Eligible current accounts for this business.</Txt>

        <View className="gap-3">
          {PLANS.map((plan) => {
            const active = plan.id === selected;
            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelected(plan.id)}
                style={active ? shadowSm : undefined}
                className={cn('overflow-hidden rounded-2xl border bg-card', active ? 'border-blue-500' : 'border-line')}
              >
                <View className="p-4">
                  <View className="flex-row items-start gap-3">
                    <View className="flex-1">
                      {plan.recommended ? (
                        <View className="mb-2 flex-row items-center gap-1 self-start rounded-md bg-blue-50 px-2 py-1">
                          <Sparkles size={12} color={C.brand} strokeWidth={2.5} />
                          <Txt weight={700} className="text-[10px] tracking-[0.3px] text-brand">
                            RECOMMENDED · BEST VALUE
                          </Txt>
                        </View>
                      ) : null}
                      <Txt weight={700} className="text-[17px] tracking-[-0.2px] text-ink">
                        {plan.name}
                      </Txt>
                      <Txt className="mt-0.5 text-[12.5px] leading-[17px] text-ink-3">{plan.tagline}</Txt>
                    </View>
                    <View className={cn('mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full border-2', active ? 'border-blue-500 bg-blue-500' : 'border-line-strong')}>
                      {active ? <View className="h-2 w-2 rounded-full bg-white" /> : null}
                    </View>
                  </View>

                  <View className="mt-3 flex-row items-baseline gap-1.5">
                    <Txt className="text-[13px] text-ink-3">Min. balance</Txt>
                    <Txt weight={700} className="text-[15px] text-ink">
                      {plan.minBalance}
                    </Txt>
                  </View>

                  {active ? (
                    <View className="mt-3.5 gap-2 border-t border-line pt-3.5">
                      {plan.features.map((f) => (
                        <View key={f} className="flex-row items-start gap-2.5">
                          <Check size={17} color={C.posFg} strokeWidth={2.5} style={{ marginTop: 1 }} />
                          <Txt className="flex-1 text-[13.5px] leading-[18px] text-ink-2">{f}</Txt>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="mt-3 flex-row items-center gap-1">
                      <Txt weight={600} className="text-[13px] text-brand">
                        View {plan.features.length} benefits
                      </Txt>
                      <ChevronDown size={16} color={C.brand} strokeWidth={2} />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA
          label={`Continue with ${selectedPlan?.name.replace(' Account', '')}`}
          trailing={false}
          onPress={() => go('/signature-nominee')}
        />
      </BottomBar>
    </View>
  );
}

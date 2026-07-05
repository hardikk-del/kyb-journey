import { useState } from 'react';
import { View } from 'react-native';
import { Store, Users, Scale, Home, Building2 } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Input } from '@/components/Input';
import { Txt } from '@/components/Txt';
import { EntityCard } from '@/components/cards';
import { Eyebrow } from '@/components/kyb/controls';
import { FlagIN } from '@/components/glyphs';
import { useFlow } from '@/store/flow';
import { membersFor, type EntityId } from '@/lib/entities';
import { step } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C } from '@/lib/tokens';

const ENTITIES: { id: EntityId; label: string; Icon: typeof Store }[] = [
  { id: 'prop', label: 'Proprietorship', Icon: Store },
  { id: 'partner', label: 'Partnership', Icon: Users },
  { id: 'llp', label: 'LLP', Icon: Scale },
  { id: 'huf', label: 'HUF', Icon: Home },
  { id: 'ltd', label: 'Pvt or Public Ltd', Icon: Building2 },
];

export default function StartScreen() {
  const flow = useFlow();
  const [selected, setSelected] = useState<EntityId>('prop');
  const [name, setName] = useState('Ravi Kumar');
  const [mobile, setMobile] = useState('98200 41122');
  const [email, setEmail] = useState('ravi@kiranatraders.in');

  const onContinue = () => {
    flow.reset();
    flow.set({ entity: selected, members: membersFor(selected) });
    go(selected === 'prop' ? '/checklist' : '/entity-details');
  };

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...step(selected, 'entity')} title="New current account" showBack={false} />

      <Body className="gap-7">
        <View className="gap-3">
          <Eyebrow>Entity type</Eyebrow>
          <View className="flex-row flex-wrap gap-3">
            {ENTITIES.map(({ id, label, Icon }, i) => {
              const active = selected === id;
              const wide = i === ENTITIES.length - 1;
              return (
                <View key={id} className={wide ? 'w-full' : 'basis-[47%] flex-1'}>
                  <EntityCard
                    label={label}
                    selected={active}
                    onPress={() => setSelected(id)}
                    icon={<Icon size={20} color={active ? C.brand : C.ink2} strokeWidth={1.75} />}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View className="gap-4">
          <Input label="Customer name" value={name} onChangeText={setName} placeholder="Full name" />
          <Input
            label="Mobile"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            prefix={
              <View className="flex-row items-center gap-2">
                <FlagIN w={22} />
                <Txt weight={600} className="text-[14px] text-ink">
                  +91
                </Txt>
              </View>
            }
          />
          <Input
            label="Email ID"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="customer@email.com"
          />
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA label="Continue" onPress={onContinue} />
      </BottomBar>
    </View>
  );
}

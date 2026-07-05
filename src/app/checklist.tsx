import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Input } from '@/components/Input';
import { Txt } from '@/components/Txt';
import { StepRow } from '@/components/cards';
import { Eyebrow } from '@/components/kyb/controls';
import { FlagIN, WhatsAppGlyph } from '@/components/glyphs';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type Doc = { title: string; sub: string };

const CHECKLISTS: Record<string, Doc[]> = {
  prop: [
    { title: 'Identity & address', sub: 'Personal KYC of the proprietor' },
    { title: 'Business proof I', sub: 'Registration & constitution' },
    { title: 'Business proof II', sub: 'Address & operations' },
    { title: 'Bureau check', sub: 'Credit & compliance screening' },
  ],
  partner: [
    { title: 'Business PAN', sub: 'PAN of the firm' },
    { title: 'Partner KYC', sub: 'Identity & address of each partner' },
    { title: 'Partnership deed', sub: 'Executed deed of the firm' },
    { title: 'Registration certificate', sub: 'Govt certificate of name, address & activity' },
    { title: 'Applicant signature', sub: 'Applicant or one partner' },
  ],
  llp: [
    { title: 'Business PAN', sub: 'PAN of the LLP' },
    { title: 'Partner KYC', sub: 'Identity & address of partners / signatories' },
    { title: 'LLP agreement', sub: 'Executed agreement of the LLP' },
    { title: 'Incorporation certificate', sub: 'Issued by the Registrar of Companies' },
    { title: 'Account-opening resolution', sub: 'Authorising the current account' },
    { title: 'Applicant signature', sub: 'Applicant or authorised signatory' },
  ],
  huf: [
    { title: 'Business PAN', sub: 'PAN in the name of the HUF' },
    { title: 'Karta KYC', sub: 'Identity & address of the Karta' },
    { title: 'HUF declaration', sub: 'Signed by all co-parceners, naming the Karta' },
    { title: 'Karta signature', sub: 'Authorised to operate the account' },
  ],
  ltd: [
    { title: 'Business PAN', sub: 'PAN of the company' },
    { title: 'Signatory KYC', sub: 'Directors list + authorised signatory ID' },
    { title: 'Incorporation certificate', sub: 'Issued by the Registrar of Companies' },
    { title: 'Board resolution', sub: 'Directors & shareholding, on letterhead' },
    { title: 'Business address proof', sub: 'GST, trade licence or utility bill (< 3 months)' },
    { title: 'Applicant signature', sub: 'Applicant or authorised signatory' },
  ],
};

function MethodBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={active ? undefined : shadowXs}
      className={cn(
        'h-14 flex-1 items-center justify-center rounded-xl border px-2',
        active ? 'border-blue-500 bg-blue-50' : 'border-line bg-card',
      )}
    >
      <Txt weight={600} className={cn('text-[15px]', active ? 'text-blue-700' : 'text-ink')}>
        {label}
      </Txt>
    </Pressable>
  );
}

function ChannelBtn({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={shadowXs}
      className={cn(
        'h-14 flex-1 flex-row items-center justify-center gap-2.5 rounded-xl border',
        active ? 'border-ink bg-card' : 'border-line bg-card',
      )}
    >
      {icon}
      <Txt weight={600} className={cn('text-[15px]', active ? 'text-ink' : 'text-ink-2')}>
        {label}
      </Txt>
    </Pressable>
  );
}

export default function ChecklistScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const steps = CHECKLISTS[entity] ?? CHECKLISTS.prop;

  const [method, setMethod] = useState<'upload' | 'link'>('link');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [mobile, setMobile] = useState('76065 12345');
  const isLink = method === 'link';

  const onContinue = () => {
    flow.set({ method });
    if (isLink) {
      go('/link-sent');
      return;
    }
    if (entity === 'llp' || entity === 'ltd') go('/business-docs');
    else go('/identity');
  };

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('documents')} title="Document checklist" />

      <Body className="gap-7">
        <Txt className="text-[15px] text-ink-3">Collect these documents to open the current account.</Txt>

        <View>
          {steps.map((s, i) => (
            <StepRow key={s.title} n={i + 1} title={s.title} desc={s.sub} last={i === steps.length - 1} />
          ))}
        </View>

        <View className="gap-3">
          <Eyebrow>How to collect documents</Eyebrow>
          <View className="flex-row gap-3">
            <MethodBtn label="I'll upload now" active={method === 'upload'} onPress={() => setMethod('upload')} />
            <MethodBtn label="Send link to customer" active={method === 'link'} onPress={() => setMethod('link')} />
          </View>
        </View>

        {isLink ? (
          <View className="gap-4">
            <Txt className="-mt-1 text-[15px] text-ink-3">
              Choose a channel where the customer will receive the form link.
            </Txt>
            <View className="flex-row gap-3">
              <ChannelBtn
                icon={<MessageSquare size={20} color={C.ink2} strokeWidth={1.75} />}
                label="SMS"
                active={channel === 'sms'}
                onPress={() => setChannel('sms')}
              />
              <ChannelBtn
                icon={<WhatsAppGlyph size={20} />}
                label="WhatsApp"
                active={channel === 'whatsapp'}
                onPress={() => setChannel('whatsapp')}
              />
            </View>
            <Input
              label="Customer's mobile number"
              required
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              helper="This number will be used to send the link."
              prefix={
                <View className="flex-row items-center gap-2">
                  <FlagIN w={22} />
                  <Txt weight={600} className="text-[14px] text-ink">
                    +91
                  </Txt>
                </View>
              }
            />
          </View>
        ) : (
          <View style={shadowXs} className="gap-1 rounded-xl border border-line bg-card p-4">
            <Txt weight={600} className="text-[15px] text-ink">
              You'll capture documents now
            </Txt>
            <Txt className="text-[14px] leading-[19px] text-ink-3">
              Use this device to scan the customer's PAN, address proof, a live selfie, and business documents.
            </Txt>
          </View>
        )}
      </Body>

      <BottomBar>
        <PrimaryCTA label={isLink ? 'Send document link' : 'Start uploading'} onPress={onContinue} />
      </BottomBar>
    </View>
  );
}

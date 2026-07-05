import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Send, Check, Copy, Clock, MessageCircle } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Eyebrow } from '@/components/kyb/controls';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';

const propRequested = [
  { title: 'Identity and address proof', sub: 'PAN and one address proof' },
  { title: 'Selfie verification', sub: 'Live selfie for face match' },
  { title: 'Business proof', sub: 'Any 2 documents in the firm name' },
];

const ltdRequested = [
  { title: 'Certificate of Incorporation', sub: 'Issued by the Registrar of Companies' },
  { title: 'Directors, shareholding & board resolution', sub: 'On company letterhead' },
  { title: 'Authorised signatory KYC', sub: 'Identity & address proof of the signatory' },
  { title: 'Business address proof', sub: 'GST, trade licence or utility bill (< 3 months)' },
];

export default function LinkSentScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const requested = entity === 'ltd' ? ltdRequested : propRequested;
  const recipient = entity === 'ltd' ? flow.signatory ?? 'The authorised signatory' : 'Ravi Kumar';
  const [copied, setCopied] = useState(false);

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('documents')} title="Link sent to customer" />

      <Body className="gap-7">
        <View className="items-center gap-3 pt-2">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Send size={28} color={C.brand} strokeWidth={1.75} />
          </View>
          <Txt weight={700} className="text-[22px] tracking-[-0.3px] text-ink">
            Document link sent
          </Txt>
          <Txt className="max-w-[300px] text-center text-[15px] leading-[20px] text-ink-3">
            {recipient} can now upload the required documents from their own phone.
          </Txt>
        </View>

        <View style={shadowXs} className="flex-row items-center gap-3 rounded-xl border border-line bg-card p-4">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-green-500">
            <MessageCircle size={22} color="#fff" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Txt weight={600} className="text-[16px] text-ink">
              Sent on WhatsApp
            </Txt>
            <Txt mono className="text-[14px] text-ink-3">
              +91 76065 12345
            </Txt>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Check size={16} color={C.pos} strokeWidth={2.5} />
            <Txt weight={600} className="text-[14px] text-green-500">
              Delivered
            </Txt>
          </View>
        </View>

        <View className="gap-2.5">
          <Eyebrow>Secure link</Eyebrow>
          <View className="flex-row items-center gap-2 rounded-xl border border-line-strong bg-grey-100 px-3.5 py-2.5">
            <Txt mono numberOfLines={1} className="flex-1 text-[15px] text-ink-2">
              cashfree.in/kyc/Nl8x2K
            </Txt>
            <Pressable
              onPress={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="h-10 flex-row items-center gap-1.5 rounded-lg border border-line bg-card px-3 active:bg-grey-50"
            >
              {copied ? <Check size={16} color={C.pos} strokeWidth={2.5} /> : <Copy size={16} color={C.ink} strokeWidth={2} />}
              <Txt weight={600} className="text-[14px] text-ink">
                {copied ? 'Copied' : 'Copy'}
              </Txt>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Eyebrow>Requested from customer</Eyebrow>
          <View style={shadowXs} className="overflow-hidden rounded-xl border border-line bg-card">
            {requested.map((r, i) => (
              <View key={r.title} className={`flex-row items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-line' : ''}`}>
                <View className="h-6 w-6 rounded-full border-2 border-dashed border-line-strong" />
                <View className="flex-1">
                  <Txt weight={600} className="text-[16px] text-ink">
                    {r.title}
                  </Txt>
                  <Txt className="mt-0.5 text-[14px] text-ink-3">{r.sub}</Txt>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row items-start gap-2">
          <Clock size={16} color={C.ink3} strokeWidth={1.75} style={{ marginTop: 1 }} />
          <Txt className="flex-1 text-[14px] leading-[19px] text-ink-3">
            Link is valid for 24 hours. You will be notified as documents arrive.
          </Txt>
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA label="Track upload status" onPress={() => go('/review')} />
      </BottomBar>
    </View>
  );
}

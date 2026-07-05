import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FileText, Eye, ShieldCheck, Smartphone, X } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Button } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { Eyebrow, OtpInput } from '@/components/kyb/controls';
import { useFlow } from '@/store/flow';
import { ENTITY_META } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const OTP_LEN = 6;
const MASKED_MOBILE = '+91 ••••• 41122';
const SIG_PATH =
  'M8 44 C 26 8, 38 8, 40 36 C 41 50, 30 52, 34 40 C 40 22, 56 18, 60 40 C 62 52, 76 50, 84 30 C 92 12, 104 14, 100 40 L 112 22 C 118 40, 126 42, 138 26 C 150 12, 158 22, 156 38 C 170 20, 188 18, 196 38 C 200 48, 214 44, 232 24';

export default function AofEsignScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const partners = flow.members;
  const isCorporate = entity === 'llp' || entity === 'ltd';
  const authorisedSignatory = flow.signatory || partners[0];
  const meta = ENTITY_META[entity];
  const aofSubtitle = meta ? `${meta.legalName} · Digital First Account` : 'Kirana Traders · Digital First Account';

  const [stage, setStage] = useState<'intro' | 'sending' | 'otp' | 'submitting'>('intro');
  const [preview, setPreview] = useState(false);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const sendOtp = () => {
    setStage('sending');
    setTimeout(() => {
      setStage('otp');
      setSeconds(30);
    }, 1100);
  };

  const otpComplete = otp.length === OTP_LEN;
  const submit = () => {
    setStage('submitting');
    setTimeout(() => go('/submitted'), 1400);
  };

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('aof')} title="Account opening form" />

      <Body className="gap-7">
        {/* AOF document */}
        <View className="gap-2.5">
          <Eyebrow>Document</Eyebrow>
          <View style={shadowXs} className="flex-row items-center gap-3 rounded-xl border border-line bg-card p-4">
            <View className="h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={20} color={C.brand} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Txt weight={600} className="text-[15px] text-ink">
                Account Opening Form
              </Txt>
              <Txt className="mt-0.5 text-[12.5px] text-ink-3">{aofSubtitle}</Txt>
            </View>
            <Pressable onPress={() => setPreview(true)} className="h-9 flex-row items-center gap-1.5 rounded-md border border-line px-3 active:bg-grey-50">
              <Eye size={16} color={C.ink} strokeWidth={2} />
              <Txt weight={600} className="text-[13px] text-ink">
                Preview
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* Aadhaar e-sign */}
        <View className="gap-2.5">
          <Eyebrow>Aadhaar e-sign</Eyebrow>

          {stage === 'intro' || stage === 'sending' ? (
            <View style={shadowXs} className="gap-3.5 rounded-xl border border-line bg-card p-4">
              <View className="flex-row items-start gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-lg bg-grey-100">
                  <ShieldCheck size={20} color={C.ink2} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Txt weight={600} className="text-[15px] text-ink">
                    e-Sign with Aadhaar OTP
                  </Txt>
                  <Txt className="mt-1 text-[13px] leading-[18px] text-ink-2">
                    {isCorporate
                      ? `A one-time password will be sent to ${authorisedSignatory}'s (authorised signatory) Aadhaar-registered mobile number.`
                      : "A one-time password will be sent to the customer's Aadhaar-registered mobile number."}
                  </Txt>
                </View>
              </View>
              <View className="h-12 flex-row items-center gap-2 rounded-lg bg-grey-100 px-3.5">
                <Smartphone size={16} color={C.ink3} strokeWidth={2} />
                <Txt weight={600} className="text-[14px] tracking-[0.5px] text-ink">
                  {MASKED_MOBILE}
                </Txt>
              </View>
            </View>
          ) : (
            <View style={shadowXs} className="gap-4 rounded-xl border border-line bg-card p-4">
              <Txt className="text-[13.5px] leading-[18px] text-ink-2">
                Enter the 6-digit OTP sent to <Txt weight={600} className="text-ink">{MASKED_MOBILE}</Txt>
              </Txt>
              <OtpInput length={OTP_LEN} value={otp} onChange={setOtp} />
              <View className="flex-row items-center justify-between">
                <Txt className="text-[13px] text-ink-3">Didn't get it?</Txt>
                {seconds > 0 ? (
                  <Txt weight={500} className="text-[13px] text-ink-3">
                    Resend in 0:{seconds.toString().padStart(2, '0')}
                  </Txt>
                ) : (
                  <Pressable onPress={sendOtp} hitSlop={6}>
                    <Txt weight={600} className="text-[13px] text-brand">
                      Resend OTP
                    </Txt>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <Txt className="px-1 text-[12px] leading-[17px] text-ink-3">
            By e-signing, the customer authorises the bank to open the account on the terms in the AOF.
          </Txt>
        </View>
      </Body>

      <BottomBar>
        {stage === 'otp' || stage === 'submitting' ? (
          <PrimaryCTA
            label={stage === 'submitting' ? 'Submitting AOF…' : 'Verify & submit AOF'}
            trailing={false}
            disabled={!otpComplete || stage === 'submitting'}
            onPress={submit}
          />
        ) : (
          <PrimaryCTA
            label={stage === 'sending' ? 'Sending OTP…' : 'Send OTP to e-sign'}
            trailing={stage === 'intro'}
            disabled={stage === 'sending'}
            onPress={sendOtp}
          />
        )}
      </BottomBar>

      {preview ? <AofPreview entity={entity} authorisedSignatory={authorisedSignatory} partners={partners} onClose={() => setPreview(false)} /> : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-line py-2">
      <Txt className="text-[12px] text-ink-3">{label}</Txt>
      <Txt weight={500} className="flex-1 text-right text-[12.5px] leading-[17px] text-ink">
        {value}
      </Txt>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Txt weight={700} className="mb-1 text-[10px] uppercase tracking-[0.6px] text-ink-3">
        {title}
      </Txt>
      <View>{children}</View>
    </View>
  );
}

function AofPreview({ entity, authorisedSignatory, partners, onClose }: { entity: string; authorisedSignatory: string; partners: string[]; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const isCorporate = entity === 'llp' || entity === 'ltd';
  const meta = ENTITY_META[entity as keyof typeof ENTITY_META];
  const memberNoun = (meta?.memberNoun ?? 'MEMBERS').toUpperCase();
  const memberSingular = meta?.memberNounSingular ?? 'Member';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-page">
        <View style={{ paddingTop: insets.top }} className="border-b border-line bg-card">
          <View className="h-14 flex-row items-center justify-between px-5">
            <Txt weight={700} className="text-[15px] text-ink">
              Account Opening Form
            </Txt>
            <Pressable onPress={onClose} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full active:bg-grey-100">
              <X size={20} color={C.ink2} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerClassName="px-5 pt-6 pb-8">
          <View style={shadowXs} className="gap-5 rounded-xl border border-line bg-card p-5">
            <View className="items-center border-b border-line pb-4">
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <FileText size={20} color={C.brand} strokeWidth={2} />
              </View>
              <Txt weight={700} className="text-[15px] tracking-[-0.2px] text-ink">
                Current Account Opening Form
              </Txt>
              <Txt className="mt-0.5 text-[11.5px] text-ink-3">Generated 20 Jun 2026 · Ref AOF-2026-0X4F19</Txt>
            </View>

            <Block title="Entity">
              <Row label="Legal name" value={meta?.legalName ?? 'Kirana Traders'} />
              <Row label="Constitution" value={meta?.constitution ?? 'Proprietorship'} />
              <Row label="PAN" value={meta?.pan ?? 'BNZPM2501F'} />
              <Row label="Registered address" value="Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059" />
            </Block>

            {isCorporate ? (
              <Block title={memberNoun}>
                {partners.map((p, i) => (
                  <Row key={p} label={`${memberSingular} ${i + 1}`} value={p} />
                ))}
                <Row label="Authorised signatory" value={authorisedSignatory} />
              </Block>
            ) : (
              <Block title="Proprietor">
                <Row label="Name" value="Ravi Kumar" />
                <Row label="Mobile" value="+91 98200 41122" />
                <Row label="Email" value="ravi@kiranatraders.in" />
              </Block>
            )}

            <Block title="Account">
              <Row label="Product" value="Digital First Account" />
              <Row label="Minimum balance" value="₹35,000" />
              <Row label="MCC" value="5131 · Wholesale Textiles" />
            </Block>

            <Block title="Nominee">
              <Row label="Status" value="Not nominated" />
            </Block>

            <View>
              <Txt weight={700} className="mb-2 text-[10px] uppercase tracking-[0.6px] text-ink-3">
                {isCorporate ? `Signature of authorised signatory (${authorisedSignatory})` : 'Signature of applicant'}
              </Txt>
              <View className={cn('h-[80px] items-center justify-center rounded-lg border border-line bg-grey-100')}>
                <Svg width={210} height={52} viewBox="0 0 240 64">
                  <Path d={SIG_PATH} fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
          </View>
        </ScrollView>

        <BottomBar>
          <Button label="Close preview" fullWidth onPress={onClose} />
        </BottomBar>
      </View>
    </Modal>
  );
}

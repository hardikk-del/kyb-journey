import { Image } from 'expo-image';
import {
  Calendar, Camera, Check, CheckCircle2, Clock, Eye, FileText, MapPin, MessageCircle, RotateCcw,
  Send, ShieldCheck, Trash2, Upload, User, X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlagIN } from '@/components/glyphs';
import { Eyebrow, ProgressMeter, Segmented } from '@/components/kyb/controls';
import { DocThumb, DocViewer, Dropzone, ProcessingTile, StatusBadge } from '@/components/kyb/docs';
import { SelfieCapture } from '@/components/kyb/SelfieCapture';
import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { cn } from '@/lib/cn';
import { assetFor } from '@/lib/docAssets';
import { authorisedSignatoriesFor, membersFor, membersInfoFor, type MemberInfo } from '@/lib/entities';
import { go } from '@/lib/nav';
import { useStepHeader } from '@/lib/steps';
import { C, shadowXs } from '@/lib/tokens';
import { useUpload } from '@/lib/useUpload';
import { useFlow } from '@/store/flow';

type Method = 'device' | 'link';
type LinkStatus = 'idle' | 'awaiting' | 'ready' | 'verified';
type Tone = 'verified' | 'progress' | 'idle';
const OVDS = ['Driving licence', 'Voter ID', 'Passport'];

export default function SignatoryKycScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const allMembers = flow.members.length ? flow.members : membersFor(entity);
  const authorisedNames = authorisedSignatoriesFor(entity);
  // Signatory KYC only covers the authorised signatories, not every director.
  const signatoriesFiltered = allMembers.filter((s) => authorisedNames.includes(s));
  const signatories = signatoriesFiltered.length ? signatoriesFiltered : allMembers;
  const info = membersInfoFor(entity);
  const infoFor = (name: string): MemberInfo | undefined => info.find((m) => m.name === name);
  const head = useStepHeader('signatory');

  const authorised = flow.signatory || signatories[0];
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const onVerifiedChange = (name: string, v: boolean) =>
    setVerified((prev) => (prev[name] === v ? prev : { ...prev, [name]: v }));

  const verifiedCount = signatories.filter((s) => verified[s]).length;
  const allDone = verifiedCount === signatories.length;

  const proceed = () => {
    flow.set({ entity, members: allMembers, signatory: authorised });
    go('/business-details');
  };

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...head} title="Signatory KYC" />

      <Body>
        <ProgressMeter done={verifiedCount} total={signatories.length} verb="verified" />

        <View className="gap-4">
          {signatories.map((s) => (
            <SignatoryCard key={s} name={s} info={infoFor(s)} isAuthorised={authorisedNames.includes(s)} onVerifiedChange={onVerifiedChange} />
          ))}
        </View>
      </Body>

      <BottomBar
        hint={
          !allDone ? (
            <Txt weight={500} className="text-[13px] text-ink-3">
              {verifiedCount} of {signatories.length} signatories verified
            </Txt>
          ) : undefined
        }
      >
        <PrimaryCTA label="Continue to business details" disabled={!allDone} onPress={proceed} />
      </BottomBar>
    </View>
  );
}

/* ---------------- shell + header ---------------- */

function CardShell({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const border = tone === 'verified' ? 'border-green-300' : tone === 'progress' ? 'border-amber-500' : 'border-line';
  return (
    <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', border)}>
      {children}
    </View>
  );
}

function StatusPill({ tone, label }: { tone: Tone; label: string }) {
  if (tone === 'verified') {
    return (
      <View className="h-6 flex-row items-center gap-1 rounded-full bg-green-50 px-2.5">
        <CheckCircle2 size={13} color={C.posFg} />
        <Txt weight={600} className="text-[12px] text-green-700">
          {label}
        </Txt>
      </View>
    );
  }
  if (tone === 'progress') {
    return (
      <View className="h-6 flex-row items-center rounded-full bg-amber-50 px-2.5">
        <Txt weight={600} className="text-[12px] text-amber-700">
          {label}
        </Txt>
      </View>
    );
  }
  return (
    <View className="h-6 flex-row items-center rounded-full bg-grey-100 px-2.5">
      <Txt weight={500} className="text-[12px] text-ink-3">
        {label}
      </Txt>
    </View>
  );
}

function CardHead({ name, role, tone, pill }: { name: string; role: string; tone: Tone; pill: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className={cn('h-9 w-9 items-center justify-center rounded-full', tone === 'verified' ? 'bg-green-500' : 'bg-grey-100')}>
        {tone === 'verified' ? <Check size={18} color="#fff" strokeWidth={3} /> : <User size={18} color={C.brand} strokeWidth={2.5} />}
      </View>
      <View className="flex-1">
        <Txt weight={700} numberOfLines={1} className="text-[15px] text-ink">
          {name}
        </Txt>
        <Txt weight={role.includes('Authorised') ? 600 : 400} className={cn('text-[11px]', role.includes('Authorised') ? 'tracking-[0.3px] text-brand' : 'text-ink-3')}>
          {role}
        </Txt>
      </View>
      <StatusPill tone={tone} label={pill} />
    </View>
  );
}

/* ---------------- capture primitives ---------------- */

function CaptureRow({ index, label, done, divider, children }: { index: number; label: string; done: boolean; divider?: boolean; children: React.ReactNode }) {
  return (
    <View className={cn('gap-2.5', divider && 'border-t border-line pt-4')}>
      <View className="flex-row items-center gap-2">
        <View className={cn('h-5 w-5 items-center justify-center rounded-full', done ? 'bg-green-500' : 'bg-grey-100')}>
          {done ? <Check size={12} color="#fff" strokeWidth={3} /> : <Txt weight={700} className="text-[11px] text-ink-3">{index}</Txt>}
        </View>
        <Txt weight={600} className="text-[12px] uppercase tracking-[0.5px] text-ink-3">
          {label}
        </Txt>
      </View>
      {children}
    </View>
  );
}

function VerifiedDoc({ label, meta, onView, onRemove }: { label: string; meta: string; onView: () => void; onRemove: () => void }) {
  return (
    <View className="gap-2">
      <DocThumb label={label} onView={onView} height={140} />
      <View className="flex-row items-center justify-between gap-3">
        <Txt className="flex-1 text-[12px] text-ink-3">{meta}</Txt>
        <Pressable onPress={onRemove} className="h-8 flex-row items-center gap-1.5 rounded-md border border-line bg-card px-2.5 active:bg-grey-50">
          <Trash2 size={14} color={C.neg} strokeWidth={2} />
          <Txt weight={600} className="text-[12px] text-red-500">
            Remove
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

function DigiLockerDetails({ name, info }: { name: string; info?: MemberInfo }) {
  // DigiLocker returns the citizen's demographic record alongside the Aadhaar
  // number — surface it so the reviewer can eyeball it against the entity data.
  const rows: [string, string][] = [
    ['Name', name],
    ['Date of birth', info?.dob || '14 Mar 1988'],
    ['Address', info?.address || '12 Gandhipuram, Coimbatore, TN 641001'],
  ];
  return (
    <View className="gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
      <View className="flex-row items-center gap-1.5">
        <ShieldCheck size={12} color={C.brand} strokeWidth={2} />
        <Txt weight={600} className="text-[10px] uppercase tracking-[0.5px] text-brand">
          Fetched from DigiLocker
        </Txt>
      </View>
      {rows.map(([k, v]) => (
        <View key={k} className="flex-row items-start justify-between gap-3">
          <Txt className="text-[12px] text-ink-3">{k}</Txt>
          <Txt weight={500} className="flex-1 text-right text-[12px] leading-[16px] text-ink">
            {v}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/* ---------------- signatory card (self-contained) ---------------- */

function SignatoryCard({
  name,
  info,
  isAuthorised,
  onVerifiedChange,
}: {
  name: string;
  info?: MemberInfo;
  isAuthorised: boolean;
  onVerifiedChange: (name: string, v: boolean) => void;
}) {
  const [method, setMethod] = useState<Method>('link');

  const pan = useUpload('idle');
  const ovd = useUpload('idle');
  const selfie = useUpload('idle');
  const [aadhaarTab, setAadhaarTab] = useState<'digilocker' | 'ovd'>('digilocker');
  const [aadhaarFetched, setAadhaarFetched] = useState(false);
  const [aadhaarFetching, setAadhaarFetching] = useState(false);
  const [ovdType, setOvdType] = useState('Driving licence');

  const [phone, setPhone] = useState('');
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('idle');
  const [linkSent, setLinkSent] = useState(false);
  const [preview, setPreview] = useState(false);
  const [selfieOpen, setSelfieOpen] = useState(false);
  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const aadhaarDone = aadhaarTab === 'digilocker' ? aadhaarFetched : ovd.status === 'verified';
  const deviceSteps = (pan.status === 'verified' ? 1 : 0) + (aadhaarDone ? 1 : 0) + (selfie.status === 'verified' ? 1 : 0);
  const deviceDone = deviceSteps === 3;
  const verified = method === 'device' ? deviceDone : linkStatus === 'verified';

  useEffect(() => onVerifiedChange(name, verified), [verified, name, onVerifiedChange]);

  const deviceStarted = pan.status !== 'idle' || aadhaarFetched || aadhaarFetching || ovd.status !== 'idle' || selfie.status !== 'idle';
  const started = method === 'device' ? deviceStarted : linkStatus !== 'idle';
  const tone: Tone = verified ? 'verified' : started ? 'progress' : 'idle';
  const role = isAuthorised ? 'Authorised signatory' : 'Signatory';

  const pill = verified
    ? 'Verified'
    : method === 'link'
      ? linkStatus === 'awaiting'
        ? 'Awaiting docs'
        : linkStatus === 'ready'
          ? 'Ready to review'
          : 'Pending'
      : deviceStarted
        ? `${deviceSteps}/3 captured`
        : 'Pending';

  const fetchAadhaar = () => {
    setAadhaarFetching(true);
    // Simulate the DigiLocker consent redirect + fetch round-trip.
    timers.current.push(
      setTimeout(() => {
        setAadhaarFetching(false);
        setAadhaarFetched(true);
      }, 1400),
    );
  };

  const sendLink = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLinkStatus('awaiting');
    setLinkSent(true);
    // A real signatory may take hours or days; we simulate their upload landing.
    timers.current.push(setTimeout(() => setLinkStatus('ready'), 6000));
  };
  const cancelLink = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLinkStatus('idle');
  };
  const approve = () => {
    setPreview(false);
    setLinkStatus('verified');
  };

  /* ---- verified: collapsed summary ---- */
  if (verified) {
    return (
      <CardShell tone="verified">
        <CardHead name={name} role={role} tone="verified" pill="Verified" />
        <View className="gap-2.5 border-t border-line pt-3">
          <View className="flex-row items-center gap-2">
            <ShieldCheck size={16} color={C.posFg} strokeWidth={2} />
            <Txt className="flex-1 text-[13px] text-green-700">
              PAN, OVD & selfie verified
            </Txt>
          </View>
          <Pressable onPress={() => setPreview(true)} className="h-11 flex-row items-center justify-center gap-2 rounded-lg border border-line bg-card active:bg-grey-50">
            <Eye size={16} color={C.ink} strokeWidth={2} />
            <Txt weight={600} className="text-[14px] text-ink">
              Preview KYC
            </Txt>
          </Pressable>
        </View>
        {preview ? <SignatoryPreview name={name} info={info} onClose={() => setPreview(false)} /> : null}
      </CardShell>
    );
  }

  /* ---- active: setup / capture / tracking ---- */
  return (
    <CardShell tone={tone}>
      <CardHead name={name} role={role} tone={tone} pill={pill} />

      {info?.dob || info?.address ? (
        <View className="-mt-1 gap-0.5 pl-11">
          {info?.dob ? (
            <View className="flex-row items-center gap-1">
              <Calendar size={12} color={C.ink3} strokeWidth={2} />
              <Txt className="text-[12px] text-ink-3">DOB · {info.dob}</Txt>
            </View>
          ) : null}
          {info?.address ? (
            <View className="flex-row items-start gap-1">
              <MapPin size={12} color={C.ink3} strokeWidth={2} style={{ marginTop: 2 }} />
              <Txt className="flex-1 text-[12px] leading-[16px] text-ink-3">{info.address}</Txt>
            </View>
          ) : null}
        </View>
      ) : null}

      {method === 'link' && linkStatus !== 'idle' ? null : (
        <Segmented
          value={method}
          onChange={setMethod}
          height={40}
          options={[
            { value: 'device', label: 'On this device', icon: <Upload size={16} color={method === 'device' ? C.ink : C.ink3} strokeWidth={2} /> },
            { value: 'link', label: 'Send link', icon: <MessageCircle size={16} color={method === 'link' ? C.ink : C.ink3} strokeWidth={2} /> },
          ]}
        />
      )}

      {method === 'device' ? (
        <View className="mt-0.5 gap-4">
          {/* 1 · PAN */}
          <CaptureRow index={1} label="PAN card" done={pan.status === 'verified'}>
            {pan.status === 'verified' ? (
              <VerifiedDoc label="PAN card" meta="pan_card.pdf" onView={() => setViewer({ label: 'PAN card', meta: 'pan_card.pdf' })} onRemove={pan.reset} />
            ) : pan.status === 'idle' ? (
              <Dropzone title="Capture or upload PAN" hint="Camera or file · JPG / PDF" onPick={pan.start} dense />
            ) : (
              <ProcessingTile status={pan.status} label="PAN" dense />
            )}
          </CaptureRow>

          {/* 2 · Aadhaar / OVD */}
          <CaptureRow index={2} label="Aadhaar or OVD" done={aadhaarDone} divider>
            <Segmented
              value={aadhaarTab}
              onChange={setAadhaarTab}
              height={36}
              options={[
                { value: 'digilocker', label: 'Aadhaar · DigiLocker' },
                { value: 'ovd', label: 'Upload OVD' },
              ]}
            />
            {aadhaarTab === 'digilocker' ? (
              aadhaarFetched ? (
                <View className="gap-3 rounded-lg border border-green-300 bg-card p-3">
                  <View className="flex-row items-center gap-2.5">
                    <ShieldCheck size={16} color={C.pos} strokeWidth={2} />
                    <View className="flex-1">
                      <Txt weight={600} className="text-[14px] text-ink">
                        Aadhaar fetched
                      </Txt>
                      <Txt mono className="text-[12px] text-ink-3">
                        {info?.aadhaar ?? 'xxxx xxxx 1234'}
                      </Txt>
                    </View>
                    <StatusBadge kind="verified" />
                  </View>
                  <DigiLockerDetails name={name} info={info} />
                </View>
              ) : aadhaarFetching ? (
                <View className="h-11 flex-row items-center justify-center gap-2.5 rounded-lg border border-line bg-grey-50">
                  <ActivityIndicator size="small" color={C.brand} />
                  <Txt weight={600} className="text-[14px] text-ink-2">
                    Fetching from DigiLocker…
                  </Txt>
                </View>
              ) : (
                <Pressable onPress={fetchAadhaar} className="h-11 flex-row items-center justify-center gap-2 rounded-lg border border-line bg-card active:bg-grey-50">
                  <ShieldCheck size={16} color={C.brand} strokeWidth={2} />
                  <Txt weight={600} className="text-[14px] text-ink">
                    Fetch from DigiLocker
                  </Txt>
                </Pressable>
              )
            ) : (
              <View className="gap-2.5">
                <View className="flex-row gap-2">
                  {OVDS.map((o) => {
                    const active = ovdType === o;
                    return (
                      <Pressable
                        key={o}
                        onPress={() => setOvdType(o)}
                        disabled={ovd.status !== 'idle'}
                        className={cn('h-10 flex-1 items-center justify-center rounded-lg border px-1', active ? 'border-ink bg-ink' : 'border-line bg-card')}
                      >
                        <Txt weight={600} className={cn('text-[12px]', active ? 'text-white' : 'text-ink')}>
                          {o}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
                {ovd.status === 'verified' ? (
                  <VerifiedDoc
                    label={ovdType}
                    meta={`${ovdType.split(' ')[0].toLowerCase()}_proof.pdf`}
                    onView={() => setViewer({ label: ovdType, meta: `${ovdType.split(' ')[0].toLowerCase()}_proof.pdf` })}
                    onRemove={ovd.reset}
                  />
                ) : ovd.status === 'idle' ? (
                  <Dropzone title={`Capture or upload ${ovdType}`} hint="Camera or file · JPG / PDF" onPick={ovd.start} dense />
                ) : (
                  <ProcessingTile status={ovd.status} label={ovdType} dense />
                )}
              </View>
            )}
          </CaptureRow>

          {/* 3 · Selfie */}
          <CaptureRow index={3} label="Live selfie" done={selfie.status === 'verified'} divider>
            {selfie.status === 'verified' ? (
              <View className="flex-row items-center gap-3 rounded-lg border border-green-300 bg-card p-2.5">
                <Image source={{ uri: assetFor('selfie') }} style={{ width: 48, height: 48, borderRadius: 8 }} contentFit="cover" contentPosition="top" />
                <View className="flex-1">
                  <Txt weight={600} className="text-[14px] text-ink">
                    Selfie captured
                  </Txt>
                  <Txt className="text-[12px] text-ink-3">Liveness passed · face matched</Txt>
                </View>
                <StatusBadge kind="verified" />
              </View>
            ) : selfie.status === 'idle' ? (
              <Pressable onPress={() => setSelfieOpen(true)} className="h-11 flex-row items-center justify-center gap-2 rounded-lg border border-line bg-card active:bg-grey-50">
                <Camera size={16} color={C.ink} strokeWidth={2} />
                <Txt weight={600} className="text-[14px] text-ink">
                  Capture live selfie
                </Txt>
              </Pressable>
            ) : (
              <ProcessingTile status={selfie.status} label="selfie" dense />
            )}
          </CaptureRow>
        </View>
      ) : (
        /* ---- link method ---- */
        <View className="gap-3">
          {linkStatus === 'idle' ? (
            <>
              <View
                className={cn(
                  'h-12 flex-row items-center rounded-lg border bg-card pr-3.5',
                  phone.length === 10 ? 'border-green-300' : 'border-line-strong',
                )}
              >
                <View className="h-full flex-row items-center gap-2 border-r border-line px-3.5">
                  <FlagIN w={24} />
                  <Txt weight={600} className="text-[15px] text-ink">
                    +91
                  </Txt>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="rgb(141,141,141)"
                  style={
                    phone.length
                      ? { fontFamily: 'DMSans_500Medium', letterSpacing: 1 }
                      : { fontFamily: 'DMSans_400Regular', letterSpacing: 0 }
                  }
                  className="ml-3.5 flex-1 text-[15px] text-ink"
                />
                {phone.length === 10 ? <CheckCircle2 size={18} color={C.posFg} strokeWidth={2} /> : null}
              </View>
              <Pressable
                onPress={sendLink}
                disabled={phone.length !== 10}
                className={cn('h-11 flex-row items-center justify-center gap-2 rounded-lg', phone.length === 10 ? 'bg-ink active:bg-grey-900' : 'bg-line-strong')}
              >
                <Send size={16} color="#fff" strokeWidth={2} />
                <Txt weight={600} className="text-[14px] text-white">
                  Send secure link
                </Txt>
              </Pressable>
            </>
          ) : linkStatus === 'awaiting' ? (
            <View className="gap-2.5 rounded-lg border border-line bg-grey-50 p-3.5">
              <View className="flex-row items-center gap-2.5">
                <View className="h-8 w-8 items-center justify-center rounded-full border border-line bg-card">
                  <Clock size={16} color={C.ink3} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Txt weight={600} className="text-[13.5px] text-ink">
                    Awaiting documents
                  </Txt>
                  <Txt className="text-[12px] text-ink-3">Secure link sent to {name}</Txt>
                </View>
              </View>
              <View className="flex-row items-center gap-2 rounded-md border border-line bg-card px-2.5 py-2">
                <MessageCircle size={14} color={C.pos} strokeWidth={2} />
                <Txt mono className="flex-1 text-[12px] text-ink-2">
                  +91 {phone}
                </Txt>
                <Txt weight={500} className="text-[11px] text-ink-3">
                  WhatsApp · SMS
                </Txt>
              </View>
              
              <View className="flex-row gap-4 pt-0.5">
                <Pressable onPress={sendLink} hitSlop={6}>
                  <Txt weight={600} className="text-[13px] text-brand">
                    Resend link
                  </Txt>
                </Pressable>
                <Pressable onPress={cancelLink} hitSlop={6}>
                  <Txt weight={600} className="text-[13px] text-ink-3">
                    Cancel
                  </Txt>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3.5">
              <View className="flex-row items-center gap-2.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-500">
                  <Check size={16} color="#fff" strokeWidth={3} />
                </View>
                <View className="flex-1">
                  <Txt weight={600} className="text-[13.5px] text-ink">
                    Documents uploaded
                  </Txt>
                  <Txt className="text-[12px] text-ink-3">{name} submitted PAN, OVD & selfie</Txt>
                </View>
              </View>
              <Txt className="text-[12px] leading-[16px]" style={{ color: C.amberFg }}>
                Review the submission, then mark it approved to complete verification.
              </Txt>
              <Pressable
                onPress={() => setPreview(true)}
                className="h-11 flex-row items-center justify-center gap-2 rounded-lg bg-ink active:bg-grey-900"
              >
                <Eye size={16} color="#fff" strokeWidth={2} />
                <Txt weight={600} className="text-[14px] text-white">
                  Review & approve
                </Txt>
              </Pressable>
            </View>
          )}
        </View>
      )}

      <Modal visible={selfieOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setSelfieOpen(false)}>
        <SelfieCapture
          subjectName={name}
          useLabel="Use this selfie"
          onClose={() => setSelfieOpen(false)}
          onUse={() => {
            setSelfieOpen(false);
            selfie.set('verified');
          }}
        />
      </Modal>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ''} meta={viewer?.meta} onClose={() => setViewer(null)} />
      <LinkSentDialog open={linkSent} name={name} phone={phone} onClose={() => setLinkSent(false)} />
      {preview ? (
        <SignatoryPreview name={name} info={info} pending onApprove={approve} onClose={() => setPreview(false)} />
      ) : null}
    </CardShell>
  );
}

/* ---------------- link sent success popup ---------------- */

function LinkSentDialog({ open, name, phone, onClose }: { open: boolean; name: string; phone: string; onClose: () => void }) {
  // Non-breaking spaces so the number never wraps mid-sequence.
  const prettyPhone = `+91 ${phone.replace(/(\d{5})(\d+)/, '$1 $2')}`;
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <View style={shadowXs} className="w-full max-w-[340px] items-center gap-3 rounded-2xl bg-card px-3 py-7">
          <View className="h-[68px] w-[68px] items-center justify-center rounded-full bg-green-100">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500">
              <Send size={21} color="#fff" strokeWidth={2.5} />
            </View>
          </View>
          <Txt weight={700} className="text-[17px] tracking-[-0.2px] text-ink">
            Secure link sent
          </Txt>
          <Txt className="px-1 text-center text-[13px] leading-[19px] text-ink-3">
            {name} will get a WhatsApp & SMS link at{' '}
            <Txt weight={600} className="text-ink">
              {prettyPhone}
            </Txt>{' '}
            to submit their KYC.
          </Txt>
          <View className="mt-1 w-full flex-row items-center gap-2.5 rounded-lg bg-grey-100 px-3.5 py-3">
            <Clock size={15} color={C.ink3} strokeWidth={2} />
            <Txt className="flex-1 text-[12px] leading-[16px] text-ink-3">
              This can take a while. You’ll see their documents here once uploaded — no need to wait.
            </Txt>
          </View>
          <Pressable onPress={onClose} className="mt-4 h-12 w-full items-center justify-center rounded-xl bg-ink active:bg-grey-900">
            <Txt weight={600} className="text-[14px] text-white">
              Got it
            </Txt>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- KYC review + approve modal ---------------- */

type DocState = 'pending' | 'approved' | 'retake';

function KVBlock({ tag, rows }: { tag: string; rows: [string, string][] }) {
  return (
    <View className="gap-2 rounded-lg bg-blue-50 px-3.5 py-3">
      <View className="flex-row items-center gap-1.5">
        <ShieldCheck size={14} color={C.brand} strokeWidth={2} />
        <Txt weight={600} className="text-[11px] uppercase tracking-[0.5px] text-brand">
          {tag}
        </Txt>
      </View>
      {rows.map(([k, v]) => (
        <View key={k} className="flex-row items-center justify-between gap-3">
          <Txt className="text-[14px] text-ink-3">{k}</Txt>
          <Txt weight={500} className="text-[14px] text-ink">
            {v}
          </Txt>
        </View>
      ))}
    </View>
  );
}

function ApproveActions({ state, onApprove, onRetake, onUndo }: { state: DocState; onApprove: () => void; onRetake: () => void; onUndo: () => void }) {
  if (state === 'approved') {
    return (
      <View className="h-12 flex-row items-center justify-between rounded-lg bg-green-50 px-3.5">
        <View className="flex-row items-center gap-1.5">
          <Check size={16} color={C.posFg} strokeWidth={2.5} />
          <Txt weight={600} className="text-[14px] text-green-700">
            Approved
          </Txt>
        </View>
        <Pressable onPress={onUndo} hitSlop={6}>
          <Txt weight={500} className="text-[13px] text-ink-3">
            Undo
          </Txt>
        </Pressable>
      </View>
    );
  }
  if (state === 'retake') {
    return (
      <View className="h-12 flex-row items-center justify-between rounded-lg bg-amber-50 px-3.5">
        <View className="flex-row items-center gap-1.5">
          <RotateCcw size={15} color={C.amberFg} strokeWidth={2} />
          <Txt weight={600} className="text-[14px] text-amber-700">
            Retake requested
          </Txt>
        </View>
        <Pressable onPress={onUndo} hitSlop={6}>
          <Txt weight={500} className="text-[13px] text-ink-3">
            Undo
          </Txt>
        </Pressable>
      </View>
    );
  }
  return (
    <View className="flex-row gap-3">
      <Pressable onPress={onRetake} className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-md border border-line bg-card active:bg-grey-50">
        <RotateCcw size={16} color={C.ink} strokeWidth={2} />
        <Txt weight={600} className="text-[14px] text-ink">
          Ask for retake
        </Txt>
      </Pressable>
      <Pressable onPress={onApprove} className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-md bg-ink active:bg-grey-900">
        <Check size={16} color="#fff" strokeWidth={2.5} />
        <Txt weight={600} className="text-[14px] text-white">
          Approve
        </Txt>
      </Pressable>
    </View>
  );
}

function DocReviewCard({
  icon,
  title,
  subtitle,
  state,
  readOnly,
  onApprove,
  onRetake,
  onUndo,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  state: DocState;
  readOnly?: boolean;
  onApprove: () => void;
  onRetake: () => void;
  onUndo: () => void;
  children?: React.ReactNode;
}) {
  const border = state === 'approved' ? 'border-green-300' : state === 'retake' ? 'border-amber-500' : 'border-line';
  return (
    <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', border)}>
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-grey-100">{icon}</View>
        <View className="flex-1">
          <Txt weight={600} className="text-[16px] text-ink">
            {title}
          </Txt>
          {subtitle ? (
            <Txt mono className="mt-0.5 text-[13px] text-ink-3">
              {subtitle}
            </Txt>
          ) : null}
        </View>
        <StatusBadge kind="verified" />
      </View>
      {children}
      {readOnly ? null : <ApproveActions state={state} onApprove={onApprove} onRetake={onRetake} onUndo={onUndo} />}
    </View>
  );
}

function SignatoryPreview({
  name,
  info,
  pending,
  onApprove,
  onClose,
}: {
  name: string;
  info?: MemberInfo;
  pending?: boolean;
  onApprove?: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const readOnly = !onApprove;
  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);
  const [docStates, setDocStates] = useState<Record<string, DocState>>({ pan: 'pending', aadhaar: 'pending', selfie: 'pending' });
  const setDoc = (k: string, s: DocState) => setDocStates((prev) => ({ ...prev, [k]: s }));
  const stateOf = (k: string): DocState => (readOnly ? 'approved' : docStates[k]);

  const keys = ['pan', 'aadhaar', 'selfie'];
  const approvedCount = keys.filter((k) => docStates[k] === 'approved').length;
  const allApproved = approvedCount === keys.length;
  const firstName = name.split(' ')[0];

  const aadhaarRows: [string, string][] = [
    ['Name', name],
    ['Date of birth', info?.dob ?? '—'],
    ['Aadhaar', info?.aadhaar ?? 'xxxx xxxx 1234'],
    ['Address', info?.address ?? '—'],
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-page">
        <View style={{ paddingTop: insets.top }} className="border-b border-line bg-card">
          <View className="h-14 flex-row items-center justify-between px-5">
            <View className="flex-1 flex-row items-center gap-2">
              <Txt weight={700} numberOfLines={1} className="shrink text-[15px] text-ink">
                {name} · KYC
              </Txt>
              {pending ? (
                <View className="h-6 flex-row items-center gap-1 rounded-full bg-amber-50 px-2">
                  <Clock size={12} color={C.amberFg} strokeWidth={2} />
                  <Txt weight={600} className="text-[11px] text-amber-700">
                    Pending review
                  </Txt>
                </View>
              ) : (
                <View className="h-6 flex-row items-center gap-1 rounded-full bg-green-50 px-2">
                  <CheckCircle2 size={13} color={C.posFg} />
                  <Txt weight={600} className="text-[11px] text-green-700">
                    Verified
                  </Txt>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full active:bg-grey-100">
              <X size={20} color={C.ink2} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="gap-3.5 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Eyebrow>Identity and address</Eyebrow>

          <DocReviewCard
            icon={<FileText size={20} color={C.ink2} strokeWidth={1.75} />}
            title="PAN card"
            subtitle={info?.pan ?? 'BNZPM2501F'}
            state={stateOf('pan')}
            readOnly={readOnly}
            onApprove={() => setDoc('pan', 'approved')}
            onRetake={() => setDoc('pan', 'retake')}
            onUndo={() => setDoc('pan', 'pending')}
          >
            <DocThumb label="PAN card" onView={() => setViewer({ label: 'PAN card', meta: info?.pan ?? 'pan_card.pdf' })} height={150} />
          </DocReviewCard>

          <DocReviewCard
            icon={<ShieldCheck size={20} color={C.ink2} strokeWidth={1.75} />}
            title="Aadhaar via DigiLocker"
            subtitle={info?.aadhaar ?? 'xxxx xxxx 1234'}
            state={stateOf('aadhaar')}
            readOnly={readOnly}
            onApprove={() => setDoc('aadhaar', 'approved')}
            onRetake={() => setDoc('aadhaar', 'retake')}
            onUndo={() => setDoc('aadhaar', 'pending')}
          >
            <KVBlock tag="Fetched from DigiLocker" rows={aadhaarRows} />
          </DocReviewCard>

          <DocReviewCard
            icon={<Camera size={20} color={C.ink2} strokeWidth={1.75} />}
            title="Selfie verification"
            subtitle="Liveness passed"
            state={stateOf('selfie')}
            readOnly={readOnly}
            onApprove={() => setDoc('selfie', 'approved')}
            onRetake={() => setDoc('selfie', 'retake')}
            onUndo={() => setDoc('selfie', 'pending')}
          >
            <Pressable onPress={() => setViewer({ label: 'Selfie', meta: 'Live capture' })} className="w-full overflow-hidden rounded-lg border border-line">
              <Image source={{ uri: assetFor('selfie') }} style={{ width: '100%', height: 200 }} contentFit="cover" contentPosition="top" />
              <View className="absolute left-2.5 top-2.5 h-7 flex-row items-center gap-1.5 rounded-full bg-green-500 px-2.5">
                <ShieldCheck size={13} color="#fff" strokeWidth={2.5} />
                <Txt weight={600} className="text-[12px] text-white">
                  97% face match
                </Txt>
              </View>
              <View className="absolute bottom-2.5 right-2.5 h-7 flex-row items-center gap-1.5 rounded-full bg-ink/90 px-2.5">
                <Eye size={13} color="#fff" strokeWidth={2} />
                <Txt weight={500} className="text-[12px] text-white">
                  Tap to view
                </Txt>
              </View>
            </Pressable>
          </DocReviewCard>
        </ScrollView>

        {onApprove ? (
          <View style={{ paddingBottom: insets.bottom + 12 }} className="gap-2 border-t border-line bg-card px-5 pt-3">
            {!allApproved ? (
              <Txt className="text-center text-[12px] text-ink-3">
                Approve all {keys.length} documents to verify {firstName}
              </Txt>
            ) : null}
            <Pressable
              disabled={!allApproved}
              onPress={onApprove}
              className={cn('h-12 flex-row items-center justify-center gap-2 rounded-xl', allApproved ? 'bg-green-700 active:opacity-90' : 'bg-line-strong')}
            >
              <Check size={18} color="#fff" strokeWidth={2.5} />
              <Txt weight={600} className="text-[15px] text-white">
                {allApproved ? `Mark ${firstName} verified` : `Approve documents · ${approvedCount}/${keys.length}`}
              </Txt>
            </Pressable>
          </View>
        ) : null}

        <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ''} meta={viewer?.meta} onClose={() => setViewer(null)} />
      </View>
    </Modal>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Asset } from 'expo-asset';
import { Check, CheckCircle2, Eye, FileText, Lock, MapPin, ShieldCheck, Smartphone, Sparkles } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { FieldLabel, MoneyInput, OtpInput, PeopleSelect, ProgressMeter, SectionCard, Segmented } from '@/components/kyb/controls';
import { ResolutionPreview } from '@/components/kyb/ResolutionPreview';
import { DatePicker } from '@/components/kyb/DatePicker';
import { membersInfoFor } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { useFlow, type Person } from '@/store/flow';

const PAGE_1 = require('../../assets/images/board-resolution-p1.png');
const RESOLUTION_PDF = Asset.fromModule(require('../../assets/images/Board_Resolution_FILLED.pdf')).uri ?? '';

// Per-bank config — the pilot's board-resolution format requires two certifiers.
// Flip to 1 for banks whose format needs a single signer.
const REQUIRED_CERTIFIERS = 2;

const OTP_LEN = 6;

type Mode = 'singly' | 'jointly' | 'severally' | 'br';
const MODES: { value: Mode; label: string }[] = [
  { value: 'singly', label: 'Singly' },
  { value: 'jointly', label: 'Jointly' },
  { value: 'severally', label: 'Severally' },
  { value: 'br', label: 'As per BR' },
];
const YES_NO = [
  { value: 'yes' as const, label: 'Yes' },
  { value: 'no' as const, label: 'No' },
];

// Certifiers are the directors / company secretary fetched from MCA (Step 3).
// The registry gives us names + DIN; role + Aadhaar-registered mobile are
// synthesised here for the prototype.
type SignStatus = 'pending' | 'loadingSig' | 'sigReady' | 'otp' | 'verifying' | 'verifiedApprove' | 'signed';
interface Certifier {
  id: string;
  name: string;
  role: string;
  mobileLast4: string;
}
const ROLES = ['Director', 'Director', 'Company Secretary'];
const MOBILES = ['1122', '5678', '9012'];

// Specimen signatures on record, mapped by name (not row position). Names without
// an entry fall back to a placeholder box.
const SIGNATURES: Record<string, string> = {
  'Ravi Kumar': 'https://signaturely.com/wp-content/uploads/2020/04/mark-cuban-signature-signaturely-image.png',
  'Rahul Mishra': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQVXYLju5TI9bmnpsF9qo3Vle6vsUgtus40JIP6lFKCQ&s=10',
};

const stamp = () =>
  new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/* ---------------- small selectable pill ---------------- */

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('h-10 items-center justify-center rounded-lg border px-4', active ? 'border-blue-500 bg-blue-50' : 'border-line-strong bg-card')}
    >
      <Txt weight={600} className={cn('text-[13.5px]', active ? 'text-blue-700' : 'text-ink-2')}>
        {label}
      </Txt>
    </Pressable>
  );
}

/* ---------------- sub-section heading inside a card ---------------- */

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <Txt weight={700} className="text-[13px] text-ink">
      {children}
    </Txt>
  );
}

/* ---------------- certifier status pill ---------------- */

function StatusPill({ status }: { status: SignStatus }) {
  if (status === 'signed') {
    return (
      <View className="h-6 flex-row items-center gap-1 rounded-full bg-green-50 px-2.5">
        <CheckCircle2 size={13} color={C.posFg} />
        <Txt weight={600} className="text-[12px] text-green-700">
          Signed
        </Txt>
      </View>
    );
  }
  if (status === 'otp' || status === 'verifying' || status === 'verifiedApprove') {
    return (
      <View className="h-6 flex-row items-center gap-1.5 rounded-full bg-blue-50 px-2.5">
        {status === 'verifying' ? <ActivityIndicator size="small" color={C.brand} /> : null}
        <Txt weight={600} className="text-[12px] text-blue-700">
          Signing
        </Txt>
      </View>
    );
  }
  return (
    <View className="h-6 flex-row items-center rounded-full bg-grey-100 px-2.5">
      <Txt weight={500} className="text-[12px] text-ink-3">
        Pending
      </Txt>
    </View>
  );
}

/* ---------------- specimen signature (with fallback) ---------------- */

function SignatureImage({ name, badge }: { name: string; badge?: React.ReactNode }) {
  const uri = SIGNATURES[name];
  const [errored, setErrored] = useState(false);
  const showFallback = !uri || errored;

  return (
    <View className="w-full items-center justify-center overflow-hidden rounded-lg border border-line bg-white py-3">
      {showFallback ? (
        <View className="h-[80px] w-full items-center justify-center">
          <Txt weight={500} className="text-[12.5px] text-ink-3">
            Signature on record
          </Txt>
        </View>
      ) : (
        <Image
          source={{ uri }}
          onError={() => setErrored(true)}
          style={{ width: '90%', height: 80 }}
          contentFit="contain"
        />
      )}
      {badge ? <View className="absolute right-2.5 top-2.5">{badge}</View> : null}
    </View>
  );
}

function OtpVerifiedBadge() {
  return (
    <View className="h-6 flex-row items-center gap-1 rounded-full bg-green-500 px-2">
      <Check size={12} color="#fff" strokeWidth={3} />
      <Txt weight={700} className="text-[10.5px] uppercase tracking-[0.3px] text-white">
        OTP verified
      </Txt>
    </View>
  );
}

/* ---------------- one certifier's signing row ---------------- */

function CertifierRow({
  certifier,
  status,
  otp,
  seconds,
  verifiedAt,
  onSendOtp,
  onChangeOtp,
  onVerify,
  onResend,
  onApprove,
}: {
  certifier: Certifier;
  status: SignStatus;
  otp: string;
  seconds: number;
  verifiedAt: string;
  onSendOtp: () => void;
  onChangeOtp: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onApprove: () => void;
}) {
  const border = status === 'signed' ? 'border-green-300' : status === 'pending' ? 'border-line' : 'border-blue-200';

  // The specimen signature stays visible once fetched.
  const showSpecimen = status === 'sigReady' || status === 'otp' || status === 'verifying';

  // Live per-row activity line (rows sign in parallel).
  const liveCaption =
    status === 'loadingSig'
      ? 'Fetching signature…'
      : status === 'sigReady'
        ? 'Ready to sign'
        : status === 'otp'
          ? 'Awaiting OTP entry'
          : status === 'verifying'
            ? 'Signing…'
            : status === 'verifiedApprove'
              ? 'Awaiting your approval'
              : null;

  return (
    <View style={shadowXs} className={cn('gap-3 rounded-xl border bg-card p-4', border)}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Txt weight={700} className="text-[15px] text-ink">
            {certifier.name}
          </Txt>
          <Txt className="mt-0.5 text-[12.5px] text-ink-3">
            {certifier.role} · •••• {certifier.mobileLast4}
          </Txt>
          {liveCaption ? (
            <Txt weight={600} className="mt-0.5 text-[11.5px] text-brand">
              {liveCaption}
            </Txt>
          ) : null}
        </View>
        <StatusPill status={status} />
      </View>

      {/* fetching the signature */}
      {status === 'loadingSig' ? (
        <View className="flex-row items-center gap-2.5 border-t border-line pt-3">
          <ActivityIndicator size="small" color={C.brand} />
          <Txt weight={600} className="text-[13.5px] text-ink-2">
            Fetching signature…
          </Txt>
        </View>
      ) : null}

      {/* specimen signature (pre-verification, in-person) */}
      {showSpecimen ? (
        <View className="gap-1.5">
          <SignatureImage name={certifier.name} />
          <Txt className="text-center text-[11.5px] text-ink-3">Specimen signature on record</Txt>
        </View>
      ) : null}

      {/* verified preview */}
      {status === 'verifiedApprove' ? (
        <View className="gap-1.5">
          <SignatureImage name={certifier.name} badge={<OtpVerifiedBadge />} />
          <View className="flex-row items-center justify-center gap-1.5">
            <ShieldCheck size={12} color={C.posFg} strokeWidth={2} />
            <Txt weight={500} className="text-center text-[11.5px] text-green-700">
              Verified via Aadhaar OTP · {verifiedAt}
            </Txt>
          </View>
        </View>
      ) : null}

      {/* sigReady: Send OTP */}
      {status === 'sigReady' ? (
        <Button label="Send OTP" fullWidth leadingIcon={<Smartphone size={16} color="#fff" strokeWidth={2} />} onPress={onSendOtp} />
      ) : null}

      {/* OTP entry (below the signature) */}
      {status === 'otp' ? (
        <View className="gap-3 border-t border-line pt-3">
          <Txt className="text-[13px] leading-[18px] text-ink-2">
            Enter the 6-digit OTP sent to <Txt weight={600} className="text-ink">•••• {certifier.mobileLast4}</Txt>
          </Txt>
          <OtpInput length={OTP_LEN} value={otp} onChange={onChangeOtp} />
          <View className="flex-row items-center justify-between">
            <Txt className="text-[13px] text-ink-3">Didn't get it?</Txt>
            {seconds > 0 ? (
              <Txt weight={500} className="text-[13px] text-ink-3">
                Resend in 0:{seconds.toString().padStart(2, '0')}
              </Txt>
            ) : (
              <Pressable onPress={onResend} hitSlop={6}>
                <Txt weight={600} className="text-[13px] text-brand">
                  Resend OTP
                </Txt>
              </Pressable>
            )}
          </View>
          <Button label="Verify & sign" fullWidth disabled={otp.length !== OTP_LEN} onPress={onVerify} />
        </View>
      ) : null}

      {/* verifying */}
      {status === 'verifying' ? (
        <View className="flex-row items-center gap-2.5 border-t border-line pt-3">
          <ActivityIndicator size="small" color={C.brand} />
          <Txt weight={600} className="text-[13.5px] text-ink-2">
            Verifying…
          </Txt>
        </View>
      ) : null}

      {/* RM approval */}
      {status === 'verifiedApprove' ? (
        <View className="gap-2 border-t border-line pt-3">
          <Button label="Approve signature" fullWidth leadingIcon={<Check size={16} color="#fff" strokeWidth={2.5} />} onPress={onApprove} />
        </View>
      ) : null}
    </View>
  );
}

/* ---------------- screen ---------------- */

export default function BoardResolutionScreen() {
  const flow = useFlow();
  const header = useStepHeader('proof');

  // People come from Entity & ownership; fall back to the MCA-fetched directors
  // if the RM deep-linked straight here. Nobody new is typed on this screen.
  const people = useMemo<Person[]>(() => {
    if (flow.people.length) return flow.people;
    return membersInfoFor(flow.entity).map((m, i) => ({ id: `d${i}`, name: m.name, designation: 'Director' }));
  }, [flow.people, flow.entity]);

  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? '';

  // Certifier pool — directors / CS fetched from MCA, with role + mobile added.
  const certifierPool = useMemo<Certifier[]>(
    () => membersInfoFor(flow.entity).map((m, i) => ({ id: `c${i}`, name: m.name, role: ROLES[i] ?? 'Director', mobileLast4: MOBILES[i] ?? '0000' })),
    [flow.entity],
  );
  const certifierPersons = useMemo<Person[]>(() => certifierPool.map((c) => ({ id: c.id, name: c.name, designation: c.role })), [certifierPool]);
  const certById = (id: string) => certifierPool.find((c) => c.id === id)!;

  // Section 1 — open
  const [openers, setOpeners] = useState<string[]>([]);
  // Section 2 — operate
  const [operators, setOperators] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);
  const [minSign, setMinSign] = useState('2');
  const [opLimits, setOpLimits] = useState<Record<string, string>>({});
  // Section 3 — digital banking
  const [cibUsers, setCibUsers] = useState<string[]>([]);
  const [cibFrom, setCibFrom] = useState('');
  const [cibTo, setCibTo] = useState('');
  const [cibApprover, setCibApprover] = useState<string[]>([]);
  const [phoneUsers, setPhoneUsers] = useState<string[]>([]);
  const [cardUsers, setCardUsers] = useState<string[]>([]);
  // Section 4 — credit facilities
  const [credit, setCredit] = useState<'yes' | 'no'>('no');
  const [creditLimit, setCreditLimit] = useState('');
  const [creditSigners, setCreditSigners] = useState<string[]>([]);
  const [fdBacked, setFdBacked] = useState<'yes' | 'no'>('no');
  // Section 5 — meta + certifiers
  const [meetingDate, setMeetingDate] = useState('');
  const [certifiers, setCertifiers] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'sign'>('idle');
  const [preview, setPreview] = useState(false);

  // e-Sign state
  const [signStatus, setSignStatus] = useState<Record<string, SignStatus>>({});
  const [otp, setOtp] = useState<Record<string, string>>({});
  const [signedAt, setSignedAt] = useState<Record<string, string>>({});
  const [verifiedAt, setVerifiedAt] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState<Record<string, number>>({});
  const [invalidated, setInvalidated] = useState(false);

  // Tick every per-row resend timer down together (rows sign in parallel).
  useEffect(() => {
    if (!Object.values(seconds).some((s) => s > 0)) return;
    const t = setTimeout(() => {
      setSeconds((prev) => {
        const next: Record<string, number> = {};
        for (const k in prev) next[k] = prev[k] > 0 ? prev[k] - 1 : 0;
        return next;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const st = (id: string): SignStatus => signStatus[id] ?? 'pending';
  const signedCount = certifiers.filter((id) => st(id) === 'signed').length;
  const allSigned = certifiers.length > 0 && signedCount === certifiers.length;
  const canProceed = certifiers.length >= REQUIRED_CERTIFIERS;

  // On entering the sign stage, fetch every certifier's specimen signature in
  // parallel (staggered slightly) so all rows become actionable at once.
  useEffect(() => {
    if (status !== 'sign') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    certifiers.forEach((id, i) => {
      if (st(id) === 'pending') {
        setSignStatus((s) => ({ ...s, [id]: 'loadingSig' }));
        timers.push(setTimeout(() => setSignStatus((s) => ({ ...s, [id]: 'sigReady' })), 1200 + i * 400));
      }
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const markSigned = (id: string) => {
    setSignStatus((s) => ({ ...s, [id]: 'signed' }));
    setSignedAt((a) => ({ ...a, [id]: stamp() }));
  };
  const sendOtp = (id: string) => {
    setSignStatus((s) => ({ ...s, [id]: 'otp' }));
    setSeconds((prev) => ({ ...prev, [id]: 30 }));
  };
  const verify = (id: string) => {
    setSignStatus((s) => ({ ...s, [id]: 'verifying' }));
    setTimeout(() => {
      setSignStatus((s) => ({ ...s, [id]: 'verifiedApprove' }));
      setVerifiedAt((a) => ({ ...a, [id]: stamp() }));
    }, 2000);
  };
  const approve = (id: string) => markSigned(id);

  const canGenerate =
    openers.length > 0 &&
    operators.length > 0 &&
    mode != null &&
    (mode !== 'jointly' || Number(minSign) >= 1) &&
    (credit === 'no' || (Boolean(creditLimit) && creditSigners.length > 0)) &&
    Boolean(meetingDate.trim()) &&
    certifiers.length > 0 &&
    Boolean(location.trim());

  const generate = () => {
    // The structured answers below are what the platform injects into ICICI's
    // CA-5 template (Tables A, A2, B, C + certification) to produce the PDF.
    const _resolution = {
      openAccount: openers.map((id) => ({ id, name: nameOf(id) })),
      operateAccount: {
        signatories: operators.map((id) => ({ id, name: nameOf(id), limit: opLimits[id] || null })),
        mode,
        minSignatures: mode === 'jointly' ? Math.min(Number(minSign) || 1, operators.length) : null,
      },
      digitalBanking: {
        internetBanking: { users: cibUsers.map(nameOf), limitFrom: cibFrom || null, limitTo: cibTo || null, approver: nameOf(cibApprover[0] ?? '') || null },
        phoneEmail: phoneUsers.map(nameOf),
        debitCard: cardUsers.map(nameOf),
      },
      creditFacilities: credit === 'yes' ? { aggregateLimit: creditLimit, signatories: creditSigners.map(nameOf), fdBacked: fdBacked === 'yes' } : null,
      meta: { meetingDate, certifiers: certifiers.map((id) => certById(id).name), location },
    };
    void _resolution;
    setInvalidated(false);
    setStatus('generating');
    setTimeout(() => {
      setStatus('ready');
      setPreview(true);
    }, 1700);
  };

  const openPdf = () => {
    if (RESOLUTION_PDF) WebBrowser.openBrowserAsync(RESOLUTION_PDF).catch(() => {});
  };

  // Editing details after any signature invalidates every signature (the doc has
  // to be re-signed). Warn on the way back to the form.
  const editDetails = () => {
    setPreview(false);
    if (signedCount > 0 || Object.keys(signedAt).length > 0) {
      setSignStatus({});
      setSignedAt({});
      setVerifiedAt({});
      setOtp({});
      setSeconds({});
      setInvalidated(true);
    }
    setStatus('idle');
  };

  /* -------- e-sign + signed state -------- */
  if (status === 'sign') {
    return (
      <View className="flex-1 bg-page">
        <ScreenHeader {...header} title="Business proof" onBack={() => setStatus('ready')} />
        <Body>
          <View className="gap-1.5">
            <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
              Document 2 of 3
            </Txt>
            <Txt weight={700} className="text-[17px] tracking-[-0.2px] text-ink">
              {allSigned ? 'Board resolution signed' : 'Certifiers sign the resolution'}
            </Txt>
            <Txt className="text-[13.5px] leading-[19px] text-ink-3">
              {allSigned
                ? 'All certifiers have e-signed. The document is now locked.'
                : 'Each certifier e-signs with an Aadhaar OTP or a secure link, one after the other.'}
            </Txt>
          </View>

          {allSigned ? (
            <View style={shadowXs} className="gap-3.5 rounded-xl border border-green-300 bg-card p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-green-500">
                  <Check size={22} color="#fff" strokeWidth={3} />
                </View>
                <View className="flex-1">
                  <Txt weight={700} className="text-[16px] text-ink">
                    Board resolution signed
                  </Txt>
                  <View className="mt-0.5 flex-row items-center gap-1.5">
                    <Lock size={12} color={C.ink3} strokeWidth={2} />
                    <Txt className="text-[12.5px] text-ink-3">Document locked</Txt>
                  </View>
                </View>
              </View>
              <View className="gap-2 border-t border-line pt-3">
                {certifiers.map((id) => {
                  const c = certById(id);
                  return (
                    <View key={id} className="flex-row items-start gap-2">
                      <CheckCircle2 size={15} color={C.posFg} style={{ marginTop: 1 }} />
                      <Txt className="flex-1 text-[13px] leading-[18px] text-ink-2">
                        Signed by <Txt weight={600} className="text-ink">{c.name}</Txt>, {c.role} · {signedAt[id]}
                      </Txt>
                    </View>
                  );
                })}
              </View>
              <Pressable onPress={() => setPreview(true)} className="h-10 flex-row items-center justify-center gap-1.5 rounded-lg border border-line active:bg-grey-50">
                <Eye size={16} color={C.ink} strokeWidth={2} />
                <Txt weight={600} className="text-[13.5px] text-ink">
                  View document
                </Txt>
              </Pressable>
            </View>
          ) : (
            <ProgressMeter done={signedCount} total={certifiers.length} verb="signed" />
          )}

          <View className="gap-3.5">
            {certifiers.map((id) => {
              const c = certById(id);
              return (
                <CertifierRow
                  key={id}
                  certifier={c}
                  status={st(id)}
                  otp={otp[id] ?? ''}
                  seconds={seconds[id] ?? 0}
                  verifiedAt={verifiedAt[id] ?? ''}
                  onSendOtp={() => sendOtp(id)}
                  onChangeOtp={(v) => setOtp((o) => ({ ...o, [id]: v }))}
                  onVerify={() => verify(id)}
                  onResend={() => sendOtp(id)}
                  onApprove={() => approve(id)}
                />
              );
            })}
          </View>
        </Body>

        <BottomBar
          hint={
            !allSigned ? (
              <Txt weight={500} className="text-[13px] text-ink-3">
                {signedCount} of {certifiers.length} signed · complete all signatures to continue
              </Txt>
            ) : undefined
          }
        >
          <PrimaryCTA label="Continue" disabled={!allSigned} onPress={() => go('/business-doc-address')} />
        </BottomBar>

        <ResolutionPreview open={preview} onClose={() => setPreview(false)} onDownload={openPdf} onContinue={() => setPreview(false)} />
      </View>
    );
  }

  /* -------- generated / preview state -------- */
  if (status === 'ready') {
    return (
      <View className="flex-1 bg-page">
        <ScreenHeader {...header} title="Business proof" onBack={editDetails} />
        <Body>
          <View className="gap-1.5">
            <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
              Document 2 of 3
            </Txt>
            <Txt weight={700} className="text-[17px] tracking-[-0.2px] text-ink">
              Board resolution ready
            </Txt>
            <Txt className="text-[13.5px] leading-[19px] text-ink-3">
              Assembled from your answers in ICICI's prescribed format. Review, then have the certifiers e-sign.
            </Txt>
          </View>

          {invalidated ? (
            <View className="flex-row items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
              <ShieldCheck size={15} color={C.amberFg} strokeWidth={2} style={{ marginTop: 1 }} />
              <Txt className="flex-1 text-[12.5px] leading-[17px] text-amber-700">
                Details changed — the resolution needs to be signed again.
              </Txt>
            </View>
          ) : null}

          <View style={shadowXs} className="gap-3.5 rounded-xl border border-green-300 bg-card p-4">
            <Pressable onPress={() => setPreview(true)} className="w-full overflow-hidden rounded-lg border border-line">
              <Image source={PAGE_1} style={{ width: '100%', height: 200 }} contentFit="cover" contentPosition="top" />
              <View className="absolute bottom-2.5 right-2.5 h-7 flex-row items-center gap-1.5 rounded-full bg-ink/90 px-2.5">
                <Eye size={13} color="#fff" strokeWidth={2} />
                <Txt weight={500} className="text-[12px] text-white">
                  Tap to view
                </Txt>
              </View>
            </Pressable>
            <View className="flex-row items-center gap-2.5">
              <FileText size={18} color={C.ink3} strokeWidth={1.75} />
              <View className="flex-1">
                <Txt weight={500} mono numberOfLines={1} className="text-[14px] text-ink">
                  Board_Resolution_FILLED.pdf
                </Txt>
                <Txt className="text-[12px] text-ink-3">PDF · 2 pages</Txt>
              </View>
              <Pressable onPress={editDetails} className="h-9 items-center justify-center rounded-md border border-line bg-card px-3 active:bg-grey-50">
                <Txt weight={600} className="text-[13px] text-ink-2">
                  Edit details
                </Txt>
              </Pressable>
            </View>

            {/* certifiers who will sign — unsigned at this point */}
            <View className="gap-2 border-t border-line pt-3">
              <Txt weight={700} className="text-[11px] uppercase tracking-[0.5px] text-ink-3">
                Certified by
              </Txt>
              {certifiers.map((id) => {
                const c = certById(id);
                return (
                  <View key={id} className="flex-row items-center gap-2.5">
                    <View className="h-2 w-2 rounded-full bg-ink-3" />
                    <Txt className="flex-1 text-[13.5px] text-ink-2">
                      {c.name} · {c.role}
                    </Txt>
                  </View>
                );
              })}
            </View>
          </View>
        </Body>

        <BottomBar
          hint={
            !canProceed ? (
              <Txt weight={500} className="text-[13px] text-red-500">
                This format requires {REQUIRED_CERTIFIERS} certifiers · {certifiers.length} selected — add another on the form
              </Txt>
            ) : undefined
          }
        >
          <PrimaryCTA label="Proceed to sign" disabled={!canProceed} onPress={() => setStatus('sign')} />
        </BottomBar>

        <ResolutionPreview
          open={preview}
          onClose={() => setPreview(false)}
          onDownload={openPdf}
          onContinue={() => {
            setPreview(false);
            if (canProceed) setStatus('sign');
          }}
        />
      </View>
    );
  }

  /* -------- form state -------- */
  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...header} title="Business proof" />

      <Body>
        <View className="gap-1.5">
          <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
            Document 2 of 3
          </Txt>
          <Txt weight={700} className="text-[17px] tracking-[-0.2px] text-ink">
            Board resolution
          </Txt>
          <Txt className="text-[13.5px] leading-[19px] text-ink-3">
            Answer these questions to generate the board resolution document required to open the current account.
          </Txt>
        </View>

        {invalidated ? (
          <View className="flex-row items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
            <ShieldCheck size={15} color={C.amberFg} strokeWidth={2} style={{ marginTop: 1 }} />
            <Txt className="flex-1 text-[12.5px] leading-[17px] text-amber-700">
              Editing will require the resolution to be signed again.
            </Txt>
          </View>
        ) : null}

        {/* 1 — open */}
        <SectionCard index={1} title="Who can open the account" hint="Sign & submit the account-opening forms" required>
          <PeopleSelect people={people} selected={openers} onChange={setOpeners} placeholder="Select signatories" />
        </SectionCard>

        {/* 2 — operate */}
        <SectionCard index={2} title="Who can operate the account" hint="Sign cheques & move money" required>
          <View className="gap-4">
            <PeopleSelect people={people} selected={operators} onChange={setOperators} placeholder="Select operators" />

            {operators.length > 0 ? (
              <>
                <View className="gap-2">
                  <FieldLabel>Mode of operation</FieldLabel>
                  <View className="flex-row flex-wrap gap-2">
                    {MODES.map((m) => (
                      <Pill key={m.value} label={m.label} active={mode === m.value} onPress={() => setMode(m.value)} />
                    ))}
                  </View>
                </View>

                {mode === 'jointly' ? (
                  <View className="gap-2">
                    <FieldLabel>Minimum signatures required</FieldLabel>
                    <View className="flex-row items-center gap-3">
                      <Stepper
                        value={Math.min(Number(minSign) || 1, operators.length)}
                        min={1}
                        max={operators.length}
                        onChange={(n) => setMinSign(String(n))}
                      />
                      <Txt className="text-[13px] text-ink-3">of {operators.length} selected</Txt>
                    </View>
                  </View>
                ) : null}

                <View className="gap-2">
                  <FieldLabel>Per-signatory limit</FieldLabel>
                  <View className="gap-2">
                    {operators.map((id) => (
                      <View key={id} className="flex-row items-center gap-3">
                        <Txt weight={500} numberOfLines={1} className="flex-1 text-[14px] text-ink-2">
                          {nameOf(id)}
                        </Txt>
                        <View className="w-[150px]">
                          <MoneyInput value={opLimits[id] || ''} onChange={(v) => setOpLimits((p) => ({ ...p, [id]: v }))} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </SectionCard>

        {/* 3 — digital banking */}
        <SectionCard index={3} title="Digital banking rights" hint="Optional — leave blank to skip a channel">
          <View className="gap-5">
            <View className="gap-2">
              <SubHead>Corporate internet banking</SubHead>
              <PeopleSelect people={people} selected={cibUsers} onChange={setCibUsers} placeholder="Select users" />
              {cibUsers.length > 0 ? (
                <View className="gap-3 pt-1">
                  <View className="flex-row gap-3">
                    <View className="flex-1 gap-1.5">
                      <FieldLabel>Limit from</FieldLabel>
                      <MoneyInput value={cibFrom} onChange={setCibFrom} placeholder="0" />
                    </View>
                    <View className="flex-1 gap-1.5">
                      <FieldLabel>Limit to</FieldLabel>
                      <MoneyInput value={cibTo} onChange={setCibTo} placeholder="Max" />
                    </View>
                  </View>
                  <View className="gap-1.5">
                    <FieldLabel>Approved by</FieldLabel>
                    <PeopleSelect people={people} selected={cibApprover} onChange={setCibApprover} placeholder="Select approver" single />
                  </View>
                </View>
              ) : null}
            </View>

            <View className="gap-2">
              <SubHead>Phone / Email banking</SubHead>
              <PeopleSelect people={people} selected={phoneUsers} onChange={setPhoneUsers} placeholder="Select users" />
            </View>

            <View className="gap-2">
              <SubHead>Debit / ATM card</SubHead>
              <PeopleSelect people={people} selected={cardUsers} onChange={setCardUsers} placeholder="Select card holders" />
            </View>
          </View>
        </SectionCard>

        {/* 4 — credit facilities */}
        <SectionCard index={4} title="Credit facilities" hint="OD, CC, BG, LC">
          <View className="gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Txt weight={500} className="flex-1 text-[13.5px] leading-[18px] text-ink-2">
                Does the company want credit facilities?
              </Txt>
              <View className="w-[130px]">
                <Segmented value={credit} options={YES_NO} onChange={setCredit} height={38} />
              </View>
            </View>

            {credit === 'yes' ? (
              <View className="gap-3.5 border-t border-line pt-3.5">
                <View className="gap-1.5">
                  <FieldLabel required>Aggregate limit</FieldLabel>
                  <MoneyInput value={creditLimit} onChange={setCreditLimit} placeholder="Enter amount" height={48} />
                </View>
                <View className="gap-1.5">
                  <FieldLabel required>Authorised to sign facility documents</FieldLabel>
                  <PeopleSelect people={people} selected={creditSigners} onChange={setCreditSigners} placeholder="Select signatories" />
                </View>
                <View className="flex-row items-center justify-between gap-3">
                  <Txt weight={500} className="flex-1 text-[13.5px] text-ink-2">
                    Fixed-deposit backed?
                  </Txt>
                  <View className="w-[130px]">
                    <Segmented value={fdBacked} options={YES_NO} onChange={setFdBacked} height={38} />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </SectionCard>

        {/* 5 — meta + certifiers */}
        <SectionCard index={5} title="Resolution details" required>
          <View className="gap-3.5">
            <View className="gap-1.5">
              <FieldLabel required>Board meeting date</FieldLabel>
              <DatePicker value={meetingDate} onChange={setMeetingDate} maximumDate={new Date()} />
            </View>

            <View className="gap-1.5">
              <FieldLabel required>Certified by</FieldLabel>
              <PeopleSelect
                people={certifierPersons}
                selected={certifiers}
                onChange={setCertifiers}
                placeholder="Select certifiers (directors / CS)"
              />
              <Txt className={cn('text-[12px]', certifiers.length >= REQUIRED_CERTIFIERS ? 'text-ink-3' : 'text-amber-700')}>
                This bank's format requires {REQUIRED_CERTIFIERS} certifiers · {certifiers.length} selected
              </Txt>

              {certifiers.map((id) => {
                const c = certById(id);
                return (
                  <View key={id} className="rounded-lg border border-line bg-grey-50 p-3">
                    <Txt weight={600} className="text-[14px] text-ink">
                      {c.name}
                    </Txt>
                    <Txt className="text-[12px] text-ink-3">
                      {c.role} · •••• {c.mobileLast4}
                    </Txt>
                  </View>
                );
              })}
            </View>

            <View className="gap-1.5">
              <FieldLabel required>Meeting location</FieldLabel>
              <Input
                value={location}
                onChangeText={setLocation}
                placeholder="Registered office / city"
                prefix={<MapPin size={16} color={C.ink3} strokeWidth={2} />}
              />
            </View>
          </View>
        </SectionCard>
      </Body>

      <BottomBar
        hint={
          !canGenerate ? (
            <Txt weight={500} className="text-[13px] text-ink-3">
              Complete the required sections to generate
            </Txt>
          ) : undefined
        }
      >
        <PrimaryCTA
          label={status === 'generating' ? 'Assembling document…' : 'Generate board resolution'}
          disabled={!canGenerate || status === 'generating'}
          leadingIcon={
            status === 'generating' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Sparkles size={17} color="#fff" strokeWidth={2} />
            )
          }
          onPress={generate}
        />
      </BottomBar>
    </View>
  );
}

/* ---------------- number stepper ---------------- */

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View className="h-11 flex-row items-center rounded-lg border border-line-strong bg-card">
      <Pressable onPress={dec} className="h-full w-11 items-center justify-center active:bg-grey-50">
        <Txt weight={700} className="text-[18px] text-ink-2">
          −
        </Txt>
      </Pressable>
      <View className="w-10 items-center">
        <Txt weight={700} className="text-[16px] text-ink">
          {value}
        </Txt>
      </View>
      <Pressable onPress={inc} className="h-full w-11 items-center justify-center active:bg-grey-50">
        <Txt weight={700} className="text-[18px] text-ink-2">
          +
        </Txt>
      </Pressable>
    </View>
  );
}

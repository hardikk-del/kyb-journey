import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Image as RNImage } from 'react-native';
import { Eye, FileText, MapPin, Sparkles } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Dropdown, FieldLabel, MoneyInput, PeopleSelect, SectionCard, Segmented } from '@/components/kyb/controls';
import { ResolutionPreview } from '@/components/kyb/ResolutionPreview';
import { DatePicker } from '@/components/kyb/DatePicker';
import { membersInfoFor } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { useFlow, type Person } from '@/store/flow';

const PAGE_1 = require('../../assets/images/board-resolution-p1.png');
const RESOLUTION_PDF = RNImage.resolveAssetSource(require('../../assets/images/Board_Resolution_FILLED.pdf'))?.uri ?? '';

type Mode = 'singly' | 'jointly' | 'severally' | 'br';
const MODES: { value: Mode; label: string }[] = [
  { value: 'singly', label: 'Singly' },
  { value: 'jointly', label: 'Jointly' },
  { value: 'severally', label: 'Severally' },
  { value: 'br', label: 'As per BR' },
];
const CERTIFIERS = ['Chairman', 'Managing Director', 'Company Secretary'];
const YES_NO = [
  { value: 'yes' as const, label: 'Yes' },
  { value: 'no' as const, label: 'No' },
];

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
  // Section 5 — meta
  const [meetingDate, setMeetingDate] = useState('');
  const [certifiedBy, setCertifiedBy] = useState('');
  const [location, setLocation] = useState('');

  const [status, setStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [preview, setPreview] = useState(false);

  const canGenerate =
    openers.length > 0 &&
    operators.length > 0 &&
    mode != null &&
    (mode !== 'jointly' || Number(minSign) >= 1) &&
    (credit === 'no' || (Boolean(creditLimit) && creditSigners.length > 0)) &&
    Boolean(meetingDate.trim()) &&
    Boolean(certifiedBy) &&
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
      meta: { meetingDate, certifiedBy, location },
    };
    void _resolution;
    setStatus('generating');
    setTimeout(() => {
      setStatus('ready');
      setPreview(true);
    }, 1700);
  };

  const openPdf = () => {
    if (RESOLUTION_PDF) WebBrowser.openBrowserAsync(RESOLUTION_PDF).catch(() => {});
  };

  /* -------- generated state -------- */
  if (status === 'ready') {
    return (
      <View className="flex-1 bg-page">
        <ScreenHeader {...header} title="Business proof" />
        <Body>
          <View className="gap-1.5">
            <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
              Document 2 of 3
            </Txt>
            <Txt weight={700} className="text-[17px] tracking-[-0.2px] text-ink">
              Board resolution ready
            </Txt>
            <Txt className="text-[13.5px] leading-[19px] text-ink-3">
              Assembled from your answers in ICICI's prescribed format.
            </Txt>
          </View>

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
              <Pressable
                onPress={() => setStatus('idle')}
                className="h-9 items-center justify-center rounded-md border border-line bg-card px-3 active:bg-grey-50"
              >
                <Txt weight={600} className="text-[13px] text-ink-2">
                  Edit answers
                </Txt>
              </Pressable>
            </View>
          </View>
        </Body>

        <BottomBar>
          <PrimaryCTA label="Continue" onPress={() => go('/business-doc-address')} />
        </BottomBar>

        <ResolutionPreview
          open={preview}
          onClose={() => setPreview(false)}
          onDownload={openPdf}
          onContinue={() => {
            setPreview(false);
            go('/business-doc-address');
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

        {/* 5 — meta */}
        <SectionCard index={5} title="Resolution details" required>
          <View className="gap-3.5">
            <View className="gap-1.5">
              <FieldLabel required>Board meeting date</FieldLabel>
              <DatePicker value={meetingDate} onChange={setMeetingDate} maximumDate={new Date()} />
            </View>
            <View className="gap-1.5">
              <FieldLabel required>Certified by</FieldLabel>
              <Dropdown value={certifiedBy} options={CERTIFIERS} onChange={setCertifiedBy} placeholder="Select who certifies" />
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

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { FileText, ShieldCheck, RotateCcw, Check, Trash2, Camera, Eye, Landmark, PenTool } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Eyebrow, ProgressMeter } from '@/components/kyb/controls';
import { Dropzone, ProcessingTile, StatusBadge, DocThumb, DocViewer } from '@/components/kyb/docs';
import { useUpload } from '@/lib/useUpload';
import { useFlow } from '@/store/flow';
import { SELFIE } from '@/lib/docAssets';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const digilockerRows: [string, string][] = [
  ['Name', 'Ravi Kumar'],
  ['Date of birth', '14 Mar 1988'],
  ['Aadhaar', 'xxxx xxxx 1234'],
  ['Address', 'Coimbatore, TN 641001'],
];
const partnerTwoRows: [string, string][] = [
  ['Name', 'Rahul Mishra'],
  ['Date of birth', '22 Jul 1991'],
  ['Aadhaar', 'xxxx xxxx 5678'],
  ['Address', 'Bengaluru, KA 560001'],
];
const directorThreeRows: [string, string][] = [
  ['Name', 'Anjali Sharma'],
  ['Date of birth', '09 Nov 1985'],
  ['Aadhaar', 'xxxx xxxx 9012'],
  ['Address', 'Pune, MH 411001'],
];

function ApproveRow({ approved, onApprove, onUndo }: { approved: boolean; onApprove: () => void; onUndo: () => void }) {
  if (approved) {
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
  return (
    <View className="flex-row gap-3">
      <View className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-md border border-line bg-card">
        <RotateCcw size={16} color={C.ink} strokeWidth={2} />
        <Txt weight={600} className="text-[14px] text-ink">
          Ask for retake
        </Txt>
      </View>
      <Pressable
        onPress={onApprove}
        className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-md bg-ink active:bg-grey-900"
      >
        <Check size={16} color="#fff" strokeWidth={2.5} />
        <Txt weight={600} className="text-[14px] text-white">
          Approve
        </Txt>
      </Pressable>
    </View>
  );
}

function ReviewCard({
  icon,
  title,
  subtitle,
  children,
  approved,
  onApprove,
  onUndo,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  approved: boolean;
  onApprove: () => void;
  onUndo: () => void;
}) {
  return (
    <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', approved ? 'border-green-300' : 'border-line')}>
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-grey-100">{icon}</View>
        <View className="flex-1">
          <Txt weight={600} className="text-[16px] text-ink">
            {title}
          </Txt>
          <Txt mono className="mt-0.5 text-[13px] text-ink-3">
            {subtitle}
          </Txt>
        </View>
        <StatusBadge kind="verified" />
      </View>
      {children}
      <ApproveRow approved={approved} onApprove={onApprove} onUndo={onUndo} />
    </View>
  );
}

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

function Specimen({ name }: { name: string }) {
  return (
    <View className="min-h-[100px] items-center justify-center rounded-lg border border-line bg-grey-100 p-4">
      <Txt style={{ fontStyle: 'italic', letterSpacing: 3 }} className="text-[24px] text-ink-2 opacity-60">
        {name}
      </Txt>
      <Txt className="mt-2 text-[11px] uppercase tracking-[1px] text-ink-3">Captured Digital Specimen</Txt>
    </View>
  );
}

type Slot = ReturnType<typeof useUpload>;

function BizSlot({ num, slot, label, fileName, onView }: { num: 1 | 2; slot: Slot; label: string; fileName: string; onView: () => void }) {
  if (slot.status === 'verified') {
    return (
      <View style={shadowXs} className="gap-3.5 rounded-xl border border-green-300 bg-card p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Check size={14} color="#fff" strokeWidth={3} />
            </View>
            <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
              Business document {num}
            </Txt>
          </View>
          <StatusBadge kind="verified" />
        </View>
        <DocThumb label={label} onView={onView} />
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-2.5">
            <FileText size={18} color={C.ink3} strokeWidth={1.75} />
            <View className="flex-1">
              <Txt weight={500} numberOfLines={1} className="text-[14px] text-ink">
                {fileName}
              </Txt>
              <Txt className="text-[12px] text-ink-3">Uploaded by you · 240 KB</Txt>
            </View>
          </View>
          <Pressable onPress={slot.reset} className="h-9 flex-row items-center gap-1.5 rounded-md border border-line bg-card px-3 active:bg-grey-50">
            <Trash2 size={16} color={C.neg} strokeWidth={2} />
            <Txt weight={600} className="text-[13px] text-red-500">
              Remove
            </Txt>
          </Pressable>
        </View>
      </View>
    );
  }
  if (slot.status === 'idle') {
    return (
      <View style={shadowXs} className="gap-3.5 rounded-xl border border-line bg-card p-4">
        <View className="flex-row items-center gap-2.5">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-grey-100">
            <Txt weight={600} className="text-[12px] text-ink-3">
              {num}
            </Txt>
          </View>
          <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
            Business document {num}
          </Txt>
        </View>
        <Dropzone title="Upload document" hint="Waiting for customer · or upload now" onPick={slot.start} dense />
      </View>
    );
  }
  return <ProcessingTile status={slot.status} label={`Business proof ${num}`} dense />;
}

export default function ReviewScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const directors = flow.members;
  const signatory = flow.signatory || directors[0];
  const isLlp = entity === 'llp';
  const isLtd = entity === 'ltd';
  const isCorporate = isLlp || isLtd;

  const [panApproved, setPanApproved] = useState(false);
  const [aadhaarApproved, setAadhaarApproved] = useState(false);
  const [selfieApproved, setSelfieApproved] = useState(false);
  const bizI = useUpload('idle');
  const bizII = useUpload('idle');

  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [c4, setC4] = useState(false);
  const [c5, setC5] = useState(false);
  const [c6, setC6] = useState(false);

  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);
  const view = (label: string, meta?: string) => setViewer({ label, meta });

  const bizReceived = (bizI.status === 'verified' ? 1 : 0) + (bizII.status === 'verified' ? 1 : 0);
  const totalItems = isCorporate ? 6 : 4;
  const currentReceived = isCorporate ? 6 : 2 + bizReceived;
  const allReceived = isCorporate ? true : bizReceived === 2;

  const propApproved = panApproved && aadhaarApproved && selfieApproved && allReceived;
  const corporateApproved = c1 && c2 && c3 && c4 && c5 && c6;
  const allApproved = isCorporate ? corporateApproved : propApproved;

  const ctaLabel = isCorporate
    ? corporateApproved
      ? 'Verify & Continue'
      : `Approve all corporate & ${isLtd ? 'director' : 'partner'} items`
    : !allReceived
      ? `Waiting for ${4 - currentReceived} document${4 - currentReceived > 1 ? 's' : ''}`
      : propApproved
        ? 'Proceed'
        : 'Approve identity docs to proceed';

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader
        stepLabel={useStepHeader('documents').stepLabel}
        title={allReceived ? 'Review & approve' : 'Awaiting documents'}
        progress={Math.round((currentReceived / totalItems) * 100)}
      />

      <Body className="gap-7">
        <ProgressMeter done={currentReceived} total={totalItems} verb="received" />

        {isLlp ? (
          <>
            <View className="gap-3">
              <Eyebrow>Company legal documents</Eyebrow>
              <ReviewCard
                icon={<FileText size={20} color={C.ink2} strokeWidth={1.75} />}
                title="Business PAN card"
                subtitle="JHDCLKSJDB"
                approved={c1}
                onApprove={() => setC1(true)}
                onUndo={() => setC1(false)}
              >
                <DocThumb label="Business PAN" onView={() => view('Business PAN', 'JHDCLKSJDB')} />
                <View className="rounded-lg bg-blue-50 px-3.5 py-2.5">
                  <View className="flex-row justify-between">
                    <Txt className="text-[13px] text-ink-3">Entity Name</Txt>
                    <Txt weight={600} className="text-[13px] text-ink">
                      Finramp Technologies Pvt Ltd
                    </Txt>
                  </View>
                </View>
              </ReviewCard>
              <ReviewCard icon={<Landmark size={20} color={C.ink2} strokeWidth={1.75} />} title="Certificate of Incorporation" subtitle="ROC-BANGALORE" approved={c2} onApprove={() => setC2(true)} onUndo={() => setC2(false)}>
                <DocThumb label="COI Document" onView={() => view('Certificate of Incorporation', 'coi_proof.pdf')} />
              </ReviewCard>
              <ReviewCard icon={<FileText size={20} color={C.ink2} strokeWidth={1.75} />} title="LLP Agreement" subtitle="Executed Deed" approved={c3} onApprove={() => setC3(true)} onUndo={() => setC3(false)}>
                <DocThumb label="LLP Agreement" onView={() => view('LLP Agreement', 'llp_agreement.pdf')} />
              </ReviewCard>
              <ReviewCard icon={<Landmark size={20} color={C.ink2} strokeWidth={1.75} />} title="Resolution for Account Opening" subtitle="Board Authorization" approved={c4} onApprove={() => setC4(true)} onUndo={() => setC4(false)}>
                <DocThumb label="Board Resolution" onView={() => view('Account Resolution', 'board_resolution.pdf')} />
              </ReviewCard>
            </View>

            <View className="gap-3">
              <Eyebrow>Partner KYC & signatures</Eyebrow>
              <ReviewCard icon={<ShieldCheck size={20} color={C.ink2} strokeWidth={1.75} />} title="Partner KYC (Designated Partners)" subtitle="Multi-Partner Audit" approved={c5} onApprove={() => setC5(true)} onUndo={() => setC5(false)}>
                <KVBlock tag="Partner 1 fetched via DigiLocker" rows={digilockerRows} />
                <KVBlock tag="Partner 2 fetched via DigiLocker" rows={partnerTwoRows} />
              </ReviewCard>
              <ReviewCard icon={<PenTool size={20} color={C.ink2} strokeWidth={1.75} />} title="Signature of Applicant / Signatory" subtitle="AOF Specimen Capture" approved={c6} onApprove={() => setC6(true)} onUndo={() => setC6(false)}>
                <Specimen name="Ravi Kumar" />
              </ReviewCard>
            </View>
          </>
        ) : isLtd ? (
          <>
            <View className="gap-3">
              <Eyebrow>Company legal documents</Eyebrow>
              <ReviewCard icon={<FileText size={20} color={C.ink2} strokeWidth={1.75} />} title="Business PAN card" subtitle="AAGCF5123R" approved={c1} onApprove={() => setC1(true)} onUndo={() => setC1(false)}>
                <DocThumb label="Business PAN" onView={() => view('Business PAN', 'AAGCF5123R')} />
                <View className="rounded-lg bg-blue-50 px-3.5 py-2.5">
                  <View className="flex-row justify-between">
                    <Txt className="text-[13px] text-ink-3">Entity Name</Txt>
                    <Txt weight={600} className="text-[13px] text-ink">
                      Shri Shakti Properties and BMS
                    </Txt>
                  </View>
                </View>
              </ReviewCard>
              <ReviewCard icon={<Landmark size={20} color={C.ink2} strokeWidth={1.75} />} title="Certificate of Incorporation" subtitle="ROC-AHMEDABAD" approved={c2} onApprove={() => setC2(true)} onUndo={() => setC2(false)}>
                <DocThumb label="COI Document" onView={() => view('Certificate of Incorporation', 'coi_proof.pdf')} />
              </ReviewCard>
              <ReviewCard icon={<FileText size={20} color={C.ink2} strokeWidth={1.75} />} title="Directors, Shareholding & Board Resolution" subtitle="On company letterhead" approved={c3} onApprove={() => setC3(true)} onUndo={() => setC3(false)}>
                <DocThumb label="Board Resolution" onView={() => view('Directors, Shareholding & Board Resolution', 'board_resolution.pdf')} />
              </ReviewCard>
              <ReviewCard icon={<Landmark size={20} color={C.ink2} strokeWidth={1.75} />} title="Business Address Proof" subtitle="GST / trade licence / utility bill" approved={c4} onApprove={() => setC4(true)} onUndo={() => setC4(false)}>
                <DocThumb label="GST certificate" onView={() => view('Business Address Proof', 'gst_certificate.pdf')} />
              </ReviewCard>
            </View>

            <View className="gap-3">
              <Eyebrow>Director KYC & signatures</Eyebrow>
              <ReviewCard icon={<ShieldCheck size={20} color={C.ink2} strokeWidth={1.75} />} title="Director KYC" subtitle={`${directors.length} directors · signatory ${signatory}`} approved={c5} onApprove={() => setC5(true)} onUndo={() => setC5(false)}>
                {[digilockerRows, partnerTwoRows, directorThreeRows].slice(0, directors.length).map((rows, i) => (
                  <KVBlock
                    key={i}
                    tag={`${(directors[i] ?? `Director ${i + 1}`)}${directors[i] === signatory ? ' · Authorised signatory' : ''}`}
                    rows={rows}
                  />
                ))}
              </ReviewCard>
              <ReviewCard icon={<PenTool size={20} color={C.ink2} strokeWidth={1.75} />} title="Signature of Authorised Signatory" subtitle="AOF Specimen Capture" approved={c6} onApprove={() => setC6(true)} onUndo={() => setC6(false)}>
                <Specimen name={signatory} />
              </ReviewCard>
            </View>
          </>
        ) : (
          <>
            <View className="gap-3">
              <Eyebrow>Identity and address</Eyebrow>
              <ReviewCard icon={<FileText size={20} color={C.ink2} strokeWidth={1.75} />} title="PAN card" subtitle="BNZPM2501F" approved={panApproved} onApprove={() => setPanApproved(true)} onUndo={() => setPanApproved(false)}>
                <DocThumb label="PAN card" onView={() => view('PAN card', 'BNZPM2501F')} />
              </ReviewCard>
              <ReviewCard icon={<ShieldCheck size={20} color={C.ink2} strokeWidth={1.75} />} title="Aadhaar via DigiLocker" subtitle="xxxx xxxx 1234" approved={aadhaarApproved} onApprove={() => setAadhaarApproved(true)} onUndo={() => setAadhaarApproved(false)}>
                <KVBlock tag="Fetched from DigiLocker" rows={digilockerRows} />
              </ReviewCard>
              <ReviewCard icon={<Camera size={20} color={C.ink2} strokeWidth={1.75} />} title="Selfie verification" subtitle="Liveness passed" approved={selfieApproved} onApprove={() => setSelfieApproved(true)} onUndo={() => setSelfieApproved(false)}>
                <Pressable onPress={() => view('Selfie', 'Live capture')} className="w-full overflow-hidden rounded-lg border border-line">
                  <Image source={{ uri: SELFIE }} style={{ width: '100%', height: 224 }} contentFit="cover" contentPosition="top" />
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
                <View className="flex-row items-start gap-2 rounded-lg bg-green-50 px-3.5 py-2.5">
                  <ShieldCheck size={16} color={C.posFg} strokeWidth={2} style={{ marginTop: 1 }} />
                  <Txt className="flex-1 text-[13px] leading-[18px] text-green-700">
                    Face is consistent with the PAN photo and DigiLocker (Aadhaar) image.
                  </Txt>
                </View>
              </ReviewCard>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Eyebrow>Business proof</Eyebrow>
                <Txt weight={500} className="text-[13px] text-ink-3">
                  any 2
                </Txt>
              </View>
              <BizSlot num={1} slot={bizI} label="GST certificate" fileName="GST_certificate.pdf" onView={() => view('Business proof I', 'GST_certificate.pdf')} />
              <BizSlot num={2} slot={bizII} label="Utility bill" fileName="Utility_bill.pdf" onView={() => view('Business proof II', 'Utility_bill.pdf')} />
            </View>
          </>
        )}
      </Body>

      <BottomBar>
        <PrimaryCTA label={ctaLabel} disabled={!allApproved} onPress={() => go(isLtd ? '/shareholding' : '/self-declaration')} />
      </BottomBar>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ''} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </View>
  );
}

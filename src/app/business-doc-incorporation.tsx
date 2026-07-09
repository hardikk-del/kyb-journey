import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { FileText, ShieldCheck, Trash2 } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Dropzone, DocThumb, DocViewer, StatusBadge } from '@/components/kyb/docs';
import { AiExtractReview, type ReviewField } from '@/components/kyb/AiExtractReview';
import { UploadLaterSheet } from '@/components/kyb/UploadLaterSheet';
import { ENTITY_META } from '@/lib/entities';
import { useUpload } from '@/lib/useUpload';
import { useStepHeader } from '@/lib/steps';
import { useFlow } from '@/store/flow';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const TITLE = 'Certificate of Incorporation';
const FILE_NAME = 'incorporation_certificate.pdf';

/* ---------------- AI analysing tile ---------------- */

function AiAnalysing({ status }: { status: 'uploading' | 'verifying' }) {
  const uploading = status === 'uploading';
  return (
    <View style={shadowXs} className="w-full items-center justify-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-8">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
        {uploading ? <ActivityIndicator color={C.brand} /> : <ShieldCheck size={20} color={C.brand} strokeWidth={2} />}
      </View>
      <Txt weight={600} className="text-center text-[14px] text-ink-2">
        {uploading ? 'Uploading certificate…' : 'Reading the certificate…'}
      </Txt>
      {!uploading ? (
        <Txt className="text-center text-[12px] text-ink-3">Extracting entity name, CIN and registered address</Txt>
      ) : null}
    </View>
  );
}

/* ---------------- screen ---------------- */

export default function IncorporationCertificateScreen() {
  const flow = useFlow();
  const meta = ENTITY_META[flow.entity];
  const slot = useUpload('idle');
  const [viewer, setViewer] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [sheet, setSheet] = useState(false);
  const verified = slot.status === 'verified';

  const scrollRef = useRef<ScrollView>(null);

  const removeDoc = () => {
    slot.reset();
    setReviewDone(false);
  };

  const deferDoc = () => {
    if (!flow.deferredDocs.includes(TITLE)) {
      flow.set({ deferredDocs: [...flow.deferredDocs, TITLE] });
    }
    setSheet(false);
    go('/business-doc-resolution');
  };

  // Follow the AI review down as it streams in, so the RM stays on the newest
  // content (like watching a response generate) instead of scrolling manually.
  const onContentSizeChange = () => {
    if (verified && !reviewDone) scrollRef.current?.scrollToEnd({ animated: true });
  };

  // Values read off the certificate, reconciled against the MCA-fetched record.
  const fields: ReviewField[] = [
    { label: 'Document', value: 'Certificate of Incorporation', chip: 'Genuine' },
    { label: 'Entity name', value: meta?.legalName ?? 'Shri Shakti Properties and BMS' },
    { label: 'CIN', value: meta?.cin ?? 'U62013KA2023PTC181035', mono: true },
    {
      label: 'Registered / mailing address',
      value: meta?.registeredOffice ?? 'Survey No. 264, Village Navinal, Ta. Mundra, Dist. Kutch, Gujarat 370421',
    },
  ];

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('proof')} title="Business proof" />

      <Body ref={scrollRef} className="gap-5" onContentSizeChange={onContentSizeChange}>
        <View className="gap-1.5">
          <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
            Document 1 of 3
          </Txt>
          <Txt weight={600} className="text-[17px] tracking-[-0.2px] text-ink">
            {TITLE}
          </Txt>
          <Txt className="text-[14px] leading-[19px] text-ink-3">
            Issued by the Registrar of Companies.
          </Txt>
        </View>

        <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', verified ? 'border-green-300' : 'border-line')}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-grey-100">
                <FileText size={20} color={C.ink2} strokeWidth={1.75} />
              </View>
              <View className="flex-1">
                <Txt weight={600} className="text-[15px] text-ink">
                  {TITLE}
                </Txt>
                <Txt className="mt-0.5 text-[12px] text-ink-3">Certificate of Incorporation</Txt>
              </View>
            </View>
            {verified ? <StatusBadge kind="verified" /> : null}
          </View>

          {verified ? (
            <>
              <DocThumb label={TITLE} onView={() => setViewer(true)} />
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 flex-row items-center gap-2.5">
                  <FileText size={18} color={C.ink3} strokeWidth={1.75} />
                  <View className="flex-1">
                    <Txt weight={500} numberOfLines={1} className="text-[14px] text-ink">
                      {FILE_NAME}
                    </Txt>
                    <Txt className="text-[12px] text-ink-3">240 KB</Txt>
                  </View>
                </View>
                <Pressable
                  onPress={removeDoc}
                  className="h-9 flex-row items-center gap-1.5 rounded-md border border-line bg-card px-3 active:bg-grey-50"
                >
                  <Trash2 size={16} color={C.neg} strokeWidth={2} />
                  <Txt weight={600} className="text-[13px] text-red-500">
                    Remove
                  </Txt>
                </Pressable>
              </View>
            </>
          ) : slot.status === 'idle' ? (
            <Dropzone title="Capture or upload" hint="JPG / PNG / PDF · max 10 MB" onPick={slot.start} dense />
          ) : (
            <AiAnalysing status={slot.status === 'uploading' ? 'uploading' : 'verifying'} />
          )}
        </View>

        {/* AI extraction + MCA reconciliation */}
        {verified ? (
          <AiExtractReview
            fields={fields}
            source="MCA"
            subtitle="Read and cross-checked with MCA"
            verdict="Verified"
            summary="This is a genuine COI with no signs of tampering. The entity name, CIN and registered address extracted from it all match the MCA registry."
            onComplete={() => setReviewDone(true)}
          />
        ) : null}
      </Body>

      <BottomBar
        hint={
          !verified ? (
            <Pressable onPress={() => setSheet(true)} hitSlop={8}>
              <Txt weight={600} className="text-[13px] text-blue-500">
                Don't have it right now? Upload later →
              </Txt>
            </Pressable>
          ) : !reviewDone ? (
            <Txt className="text-[13px] text-ink-3">Reviewing the certificate…</Txt>
          ) : undefined
        }
      >
        <PrimaryCTA label="Continue" disabled={!verified || !reviewDone} onPress={() => go('/business-doc-resolution')} />
      </BottomBar>

      <UploadLaterSheet open={sheet} docLabel={TITLE} onConfirm={deferDoc} onClose={() => setSheet(false)} />

      <DocViewer open={viewer} label={TITLE} meta={FILE_NAME} onClose={() => setViewer(false)} />
    </View>
  );
}

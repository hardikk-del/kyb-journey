import { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { FileText, Trash2 } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Dropdown, FieldLabel } from '@/components/kyb/controls';
import { Dropzone, ProcessingTile, StatusBadge, DocThumb, DocViewer } from '@/components/kyb/docs';
import { AiExtractReview, type ReviewField } from '@/components/kyb/AiExtractReview';
import { ENTITY_META } from '@/lib/entities';
import { useUpload } from '@/lib/useUpload';
import { useStepHeader } from '@/lib/steps';
import { useFlow } from '@/store/flow';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const TITLE = 'Business Address Proof';
const FILE_NAME = 'address_proof.pdf';
const FALLBACK_ADDRESS = 'Survey No. 264, Village Navinal, Ta. Mundra, Dist. Kutch, Gujarat 370421';

const ADDRESS_PROOFS = [
  'Trade Licence / Registration Certificate',
  'Utility bill (electricity / water / gas)',
  'Latest property tax receipt',
  'Registered rent / lease agreement',
  'GST registration certificate',
  'Bank statement / passbook',
];

export default function BusinessAddressProofScreen() {
  const flow = useFlow();
  const meta = ENTITY_META[flow.entity];
  const slot = useUpload('idle');
  const [proofType, setProofType] = useState('');
  const [viewer, setViewer] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const verified = slot.status === 'verified';
  const typeSelected = Boolean(proofType);

  const scrollRef = useRef<ScrollView>(null);

  const removeDoc = () => {
    slot.reset();
    setReviewDone(false);
  };

  // Follow the AI review down as it streams in.
  const onContentSizeChange = () => {
    if (verified && !reviewDone) scrollRef.current?.scrollToEnd({ animated: true });
  };

  const licensee = flow.signatory || 'Ravi Kumar';
  const address = meta?.registeredOffice ?? FALLBACK_ADDRESS;

  // What the AI reads off the uploaded factory licence, reconciled with MCA.
  const fields: ReviewField[] = [
    { label: 'Document type', value: 'Factory Licence (Form No. 4), Government of Gujarat', chip: 'Identified' },
    { label: 'Licence granted to', value: `Mr. ${licensee}, to work a factory`, chip: 'Read' },
    { label: 'Authenticity', value: 'No signs of tampering', chip: 'Genuine' },
    { label: 'Premises address', value: address, chip: 'MCA' },
  ];

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('proof')} title="Business proof" />

      <Body ref={scrollRef} className="gap-5" onContentSizeChange={onContentSizeChange}>
        <View className="gap-1.5">
          <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
            Document 3 of 3
          </Txt>
          <Txt weight={600} className="text-[17px] tracking-[-0.2px] text-ink">
            {TITLE}
          </Txt>
          <Txt className="text-[14px] leading-[19px] text-ink-3">
            Ensure the uploaded document has the registered business address mentioned.
          </Txt>
        </View>

        <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', verified ? 'border-green-300' : 'border-line')}>
          {verified ? (
            <View className="flex-row items-center justify-between gap-2.5">
              <Txt weight={600} className="flex-1 text-[15px] leading-[20px] text-ink">
                {proofType}
              </Txt>
              <StatusBadge kind="verified" />
            </View>
          ) : (
            <View className="gap-1.5">
              <FieldLabel required>Type of address proof</FieldLabel>
              <Dropdown
                value={proofType}
                options={ADDRESS_PROOFS}
                onChange={setProofType}
                placeholder="Select the document you're uploading"
                disabled={slot.status !== 'idle'}
              />
            </View>
          )}

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
            typeSelected ? (
              <Dropzone title="Capture or upload" hint="JPG / PNG / PDF · max 10 MB" onPick={slot.start} dense />
            ) : (
              <View className="w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-grey-100 px-4 py-7">
                <Txt weight={500} className="text-center text-[13px] text-ink-3">
                  Select an address proof type above to upload
                </Txt>
              </View>
            )
          ) : (
            <ProcessingTile status={slot.status} label="document" dense />
          )}
        </View>

        {/* AI extraction + MCA reconciliation */}
        {verified ? (
          <AiExtractReview
            fields={fields}
            source="MCA"
            subtitle="Read and verified against MCA"
            verdict="Verified"
            summary={`This is a genuine Factory Licence (Form No. 4) issued by the Government of Gujarat, granting Mr. ${licensee} the licence to work a factory. It shows no signs of tampering, and the premises address on it matches the registered address on the MCA record.`}
            onComplete={() => setReviewDone(true)}
          />
        ) : null}
      </Body>

      <BottomBar
        hint={
          !verified ? (
            <Txt className="text-[13px] text-ink-3">Upload the document to continue</Txt>
          ) : !reviewDone ? (
            <Txt className="text-[13px] text-ink-3">Reviewing the document…</Txt>
          ) : undefined
        }
      >
        <PrimaryCTA label="Verify & continue" disabled={!verified || !reviewDone} onPress={() => go('/self-declaration')} />
      </BottomBar>

      <DocViewer open={viewer} label={TITLE} meta={FILE_NAME} onClose={() => setViewer(false)} />
    </View>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { FileText, Check, Trash2 } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Dropdown, ProgressMeter } from '@/components/kyb/controls';
import { Dropzone, ProcessingTile, StatusBadge, DocThumb, DocViewer } from '@/components/kyb/docs';
import { useUpload } from '@/lib/useUpload';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const docTypes = [
  'CST / VAT / GST certificate',
  'Shops & Establishment licence',
  'Udyam / MSME certificate',
  'Utility bill (electricity / water / landline)',
  'Trade licence',
  'Current account statement',
];

const CORP_DOCS: Record<string, { title: string; subtext: string }[]> = {
  llp: [
    { title: 'LLP Agreement', subtext: 'Executed agreement of the LLP' },
    { title: 'Certificate of Incorporation', subtext: 'Issued by the Registrar of Companies' },
    { title: 'Resolution for Account Opening', subtext: 'Board resolution on letterhead authorizing the current account' },
  ],
  ltd: [
    { title: 'Certificate of Incorporation', subtext: 'Issued by the Registrar of Companies' },
    { title: 'Directors, Shareholding & Board Resolution', subtext: 'List of directors, shareholding pattern & board resolution on letterhead' },
    { title: 'Authorised Signatory ID & Address', subtext: 'Identity & address proof of the authorised signatory' },
    { title: 'Business Address Proof', subtext: 'GST, trade licence or utility bill (< 3 months)' },
  ],
};

function fileNameFor(type: string) {
  const stem = type.split(/[ /]/)[0].toLowerCase();
  return `${stem}_proof.pdf`;
}

type Slot = ReturnType<typeof useUpload>;

function DocSlot({
  index,
  type,
  slot,
  disabledOptions,
  onType,
  onView,
  title,
  subtext,
  options,
  isFixed,
}: {
  index: number;
  type: string;
  slot: Slot;
  disabledOptions: string[];
  onType: (v: string) => void;
  onView: (label: string, meta: string) => void;
  title: string;
  subtext?: string;
  options: string[];
  isFixed: boolean;
}) {
  const verified = slot.status === 'verified';
  const locked = slot.status !== 'idle';
  const fileName = fileNameFor(type);

  return (
    <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', verified ? 'border-green-300' : 'border-line')}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5">
          <View
            className={cn(
              'h-6 w-6 items-center justify-center rounded-full',
              verified ? 'bg-green-500' : 'bg-grey-100',
            )}
          >
            {verified ? (
              <Check size={14} color="#fff" strokeWidth={3} />
            ) : (
              <Txt weight={600} className="text-[12px] text-ink-3">
                {index + 1}
              </Txt>
            )}
          </View>
          <View className="flex-1">
            <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
              {title}
            </Txt>
            {subtext ? <Txt className="mt-0.5 text-[12px] text-ink-3">{subtext}</Txt> : null}
          </View>
        </View>
        {verified ? <StatusBadge kind="verified" /> : null}
      </View>

      <Dropdown value={type} options={options} onChange={onType} disabled={locked || isFixed} disabledOptions={disabledOptions} />

      {verified ? (
        <>
          <DocThumb label={type} onView={() => onView(type, fileName)} />
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-2.5">
              <FileText size={18} color={C.ink3} strokeWidth={1.75} />
              <View className="flex-1">
                <Txt weight={500} numberOfLines={1} className="text-[14px] text-ink">
                  {fileName}
                </Txt>
                <Txt className="text-[12px] text-ink-3">240 KB</Txt>
              </View>
            </View>
            <Pressable
              onPress={slot.reset}
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
        <ProcessingTile status={slot.status} label="document" dense />
      )}
    </View>
  );
}

export default function BusinessDocsScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const isCorporate = entity === 'llp' || entity === 'ltd';
  const corpDocs = CORP_DOCS[entity] ?? null;
  const totalDocs = corpDocs ? corpDocs.length : 2;

  const slot0 = useUpload('verified');
  const slot1 = useUpload('idle');
  const slot2 = useUpload('idle');
  const slot3 = useUpload('idle');

  const [types, setTypes] = useState<string[]>(() => (corpDocs ? corpDocs.map((c) => c.title) : [docTypes[0], docTypes[3]]));
  const [viewer, setViewer] = useState<{ label: string; meta: string } | null>(null);

  const slots = [slot0, slot1, slot2, slot3].slice(0, totalDocs);
  const added = slots.filter((s) => s.status === 'verified').length;
  const ready = added >= totalDocs;

  const slotConfigs = corpDocs ?? Array.from({ length: totalDocs }, (_, i) => ({ title: `BUSINESS DOCUMENT ${i + 1}`, subtext: '' }));
  const setType = (i: number, v: string) => setTypes((prev) => prev.map((t, idx) => (idx === i ? v : t)));

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('proof')} title="Business proof" />

      <Body>
        <View className="gap-1.5">
          <Txt weight={600} className="text-[17px] tracking-[-0.2px] text-ink">
            {entity === 'ltd'
              ? 'Upload corporate documents for the company'
              : entity === 'llp'
                ? 'Upload corporate documents for the LLP'
                : "Any 2 documents in the firm's name"}
          </Txt>
          <Txt className="text-[14px] text-ink-3">
            {isCorporate ? 'Attach each required document below.' : 'Each must be a different document type.'}
          </Txt>
        </View>

        <ProgressMeter done={added} total={totalDocs} verb="added" />

        <View className="gap-4">
          {slots.map((slot, i) => (
            <DocSlot
              key={i}
              index={i}
              type={types[i]}
              slot={slot}
              disabledOptions={isCorporate ? [] : types.filter((_, idx) => idx !== i)}
              onType={(v) => setType(i, v)}
              onView={(label, meta) => setViewer({ label, meta })}
              title={slotConfigs[i].title}
              subtext={slotConfigs[i].subtext}
              options={isCorporate ? [slotConfigs[i].title] : docTypes}
              isFixed={isCorporate}
            />
          ))}
        </View>
      </Body>

      <BottomBar
        hint={
          !ready ? (
            <Txt className="text-[13px] text-ink-3">
              {totalDocs - added} more document needed
            </Txt>
          ) : undefined
        }
      >
        <PrimaryCTA
          label={ready ? 'Verify & continue' : `Add ${totalDocs - added} more to continue`}
          disabled={!ready}
          onPress={() => go('/self-declaration')}
        />
      </BottomBar>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ''} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </View>
  );
}

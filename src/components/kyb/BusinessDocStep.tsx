import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { FileText, Trash2 } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { FieldLabel, Dropdown } from '@/components/kyb/controls';
import { Dropzone, ProcessingTile, StatusBadge, DocThumb, DocViewer } from '@/components/kyb/docs';
import { useUpload } from '@/lib/useUpload';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

/**
 * One document = one screen. The company (ltd) business-proof flow is split into
 * three sequential steps (incorporation certificate → board resolution →
 * business address proof), each driven by this component.
 */
export function BusinessDocStep({
  step,
  total,
  title,
  subtext,
  fileName,
  ctaLabel,
  next,
  proofOptions,
}: {
  step: number;
  total: number;
  title: string;
  subtext: string;
  fileName: string;
  ctaLabel: string;
  next: string;
  /**
   * When set, the RM must first pick which accepted document they're uploading
   * as proof (e.g. the address-proof step) before the upload zone is enabled.
   */
  proofOptions?: string[];
}) {
  const slot = useUpload('idle');
  const [viewer, setViewer] = useState<{ label: string; meta: string } | null>(null);
  const [proofType, setProofType] = useState('');
  const verified = slot.status === 'verified';
  const needsType = Boolean(proofOptions);
  const typeSelected = !needsType || Boolean(proofType);

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('proof')} title="Business proof" />

      <Body className="gap-5">
        <View className="gap-1.5">
          <Txt weight={600} className="text-[11px] uppercase tracking-[0.6px] text-ink-3">
            Document {step} of {total}
          </Txt>
          <Txt weight={600} className="text-[17px] tracking-[-0.2px] text-ink">
            {title}
          </Txt>
          <Txt className="text-[14px] leading-[19px] text-ink-3">{subtext}</Txt>
        </View>

        <View style={shadowXs} className={cn('gap-3.5 rounded-xl border bg-card p-4', verified ? 'border-green-300' : 'border-line')}>
          {needsType ? (
            verified ? (
              <View className="flex-row items-center justify-between gap-2.5">
                <Txt weight={600} className="flex-1 text-[15px] leading-[20px] text-ink">
                  {proofType}
                </Txt>
                <StatusBadge kind="verified" />
              </View>
            ) : null
          ) : (
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2.5">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-grey-100">
                  <FileText size={20} color={C.ink2} strokeWidth={1.75} />
                </View>
                <View className="flex-1">
                  <Txt weight={600} className="text-[15px] text-ink">
                    {title}
                  </Txt>
                  <Txt className="mt-0.5 text-[12px] text-ink-3">{subtext}</Txt>
                </View>
              </View>
              {verified ? <StatusBadge kind="verified" /> : null}
            </View>
          )}

          {needsType && !verified ? (
            <View className="gap-1.5">
              <FieldLabel required>Type of address proof</FieldLabel>
              <Dropdown
                value={proofType}
                options={proofOptions ?? []}
                onChange={setProofType}
                placeholder="Select the document you're uploading"
                disabled={slot.status !== 'idle'}
              />
            </View>
          ) : null}

          {verified ? (
            <>
              <DocThumb label={title} onView={() => setViewer({ label: title, meta: fileName })} />
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
      </Body>

      <BottomBar
        hint={!verified ? <Txt className="text-[13px] text-ink-3">Upload the document to continue</Txt> : undefined}
      >
        <PrimaryCTA label={ctaLabel} disabled={!verified} onPress={() => go(next)} />
      </BottomBar>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ''} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </View>
  );
}

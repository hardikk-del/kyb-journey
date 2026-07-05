import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { FileText, RotateCcw, Info, ShieldCheck, Trash2 } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Eyebrow, Segmented } from '@/components/kyb/controls';
import { Dropzone, ProcessingTile, StatusBadge, DocThumb, DocViewer } from '@/components/kyb/docs';
import { useUpload } from '@/lib/useUpload';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const OVDS = ['Passport', 'Driving licence', 'Voter ID'];

export default function IdentityScreen() {
  const [tab, setTab] = useState<'aadhaar' | 'ovd'>('ovd');
  const [ovd, setOvd] = useState('Driving licence');
  const [aadhaarFetched, setAadhaarFetched] = useState(false);
  const panUpload = useUpload('verified');
  const ovdUpload = useUpload('idle');
  const [viewer, setViewer] = useState<{ label: string; meta?: string } | null>(null);

  const addressDone = tab === 'aadhaar' ? aadhaarFetched : ovdUpload.status === 'verified';

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('documents')} title="Identity & address" />

      <Body className="gap-7">
        {/* PAN */}
        <View className="gap-3">
          <Eyebrow>PAN</Eyebrow>
          <View
            style={shadowXs}
            className={cn('gap-3.5 rounded-xl border bg-card p-4', panUpload.status === 'verified' ? 'border-green-300' : 'border-line')}
          >
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-grey-100">
                <FileText size={20} color={C.ink2} strokeWidth={1.75} />
              </View>
              <View className="flex-1">
                <Txt weight={600} className="text-[16px] text-ink">
                  PAN card
                </Txt>
                <Txt mono className="mt-0.5 text-[13px] text-ink-3">
                  BNZPM2501F
                </Txt>
              </View>
              {panUpload.status === 'verified' ? <StatusBadge kind="verified" /> : null}
            </View>
            {panUpload.status === 'verified' ? (
              <>
                <DocThumb label="PAN card" onView={() => setViewer({ label: 'PAN card', meta: 'BNZPM2501F' })} />
                <Pressable
                  onPress={panUpload.reset}
                  className="h-10 flex-row items-center gap-1.5 self-start rounded-md border border-line bg-card px-3 active:bg-grey-50"
                >
                  <RotateCcw size={16} color={C.ink} strokeWidth={2} />
                  <Txt weight={500} className="text-[14px] text-ink">
                    Retake
                  </Txt>
                </Pressable>
              </>
            ) : panUpload.status === 'idle' ? (
              <Dropzone title="Capture or upload PAN" hint="Use camera or pick a file · JPG / PDF" onPick={panUpload.start} dense />
            ) : (
              <ProcessingTile status={panUpload.status} label="PAN" dense />
            )}
          </View>
        </View>

        {/* Address proof */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Eyebrow>Address proof</Eyebrow>
            <View className="flex-row items-center gap-1">
              <Info size={14} color={C.brand} strokeWidth={2} />
              <Txt weight={600} className="text-[13px] text-brand">
                any one
              </Txt>
            </View>
          </View>
          <Txt className="-mt-1 text-[14px] text-ink-3">
            Pick one: fetch Aadhaar via DigiLocker, or upload an officially valid document.
          </Txt>

          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'aadhaar', label: 'Aadhaar (DigiLocker)' },
              { value: 'ovd', label: 'Upload OVD' },
            ]}
          />

          {tab === 'aadhaar' ? (
            aadhaarFetched ? (
              <View style={shadowXs} className="flex-row items-center gap-3 rounded-xl border border-green-300 bg-card p-4">
                <ShieldCheck size={20} color={C.pos} strokeWidth={2} />
                <View className="flex-1">
                  <Txt weight={600} className="text-[15px] text-ink">
                    Aadhaar fetched
                  </Txt>
                  <Txt mono className="text-[13px] text-ink-3">
                    xxxx xxxx 1234
                  </Txt>
                </View>
                <StatusBadge kind="verified" />
              </View>
            ) : (
              <View style={shadowXs} className="gap-3.5 rounded-xl border border-line bg-card p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                    <ShieldCheck size={20} color={C.brand} strokeWidth={1.75} />
                  </View>
                  <View>
                    <Txt weight={600} className="text-[16px] text-ink">
                      Aadhaar via DigiLocker
                    </Txt>
                    <Txt className="mt-0.5 text-[13px] text-ink-3">Consent-based, paperless fetch</Txt>
                  </View>
                </View>
                <Pressable
                  onPress={() => setAadhaarFetched(true)}
                  className="h-12 items-center justify-center rounded-lg border border-line bg-card active:bg-grey-50"
                >
                  <Txt weight={600} className="text-[15px] text-ink">
                    Fetch from DigiLocker
                  </Txt>
                </Pressable>
              </View>
            )
          ) : (
            <View className="gap-3.5">
              <View className="flex-row gap-2.5">
                {OVDS.map((o) => {
                  const active = ovd === o;
                  return (
                    <Pressable
                      key={o}
                      onPress={() => setOvd(o)}
                      disabled={ovdUpload.status !== 'idle'}
                      className={cn(
                        'h-11 flex-1 items-center justify-center rounded-lg border px-1',
                        active ? 'border-ink bg-ink' : 'border-line bg-card',
                      )}
                    >
                      <Txt weight={600} className={cn('text-[13px]', active ? 'text-white' : 'text-ink')}>
                        {o}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>

              {ovdUpload.status === 'verified' ? (
                <View style={shadowXs} className="gap-3.5 rounded-xl border border-green-300 bg-card p-4">
                  <View className="flex-row items-center justify-between">
                    <Txt weight={600} className="text-[15px] text-ink">
                      {ovd}
                    </Txt>
                    <StatusBadge kind="verified" />
                  </View>
                  <DocThumb label={ovd} onView={() => setViewer({ label: ovd, meta: `${ovd.split(' ')[0].toLowerCase()}_proof.pdf` })} />
                  <Pressable
                    onPress={ovdUpload.reset}
                    className="h-9 flex-row items-center gap-1.5 self-start rounded-md border border-line bg-card px-3 active:bg-grey-50"
                  >
                    <Trash2 size={16} color={C.neg} strokeWidth={2} />
                    <Txt weight={600} className="text-[13px] text-red-500">
                      Remove
                    </Txt>
                  </Pressable>
                </View>
              ) : ovdUpload.status === 'idle' ? (
                <Dropzone title={`Capture or upload ${ovd}`} hint="Use camera or pick a file · JPG / PDF" onPick={ovdUpload.start} />
              ) : (
                <ProcessingTile status={ovdUpload.status} label={ovd} />
              )}
            </View>
          )}
        </View>
      </Body>

      <BottomBar>
        <PrimaryCTA
          label={addressDone ? 'Verify & continue' : 'Add address proof to continue'}
          disabled={!addressDone}
          onPress={() => go('/business-proof')}
        />
      </BottomBar>

      <DocViewer open={Boolean(viewer)} label={viewer?.label ?? ''} meta={viewer?.meta} onClose={() => setViewer(null)} />
    </View>
  );
}

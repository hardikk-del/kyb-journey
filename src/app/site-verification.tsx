import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Camera, MapPin, RotateCcw, Check, Search, Plus, X, ShieldCheck, Trash2, Sparkles } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Eyebrow, Req } from '@/components/kyb/controls';
import { BusinessReview, type ConsistencyRow } from '@/components/kyb/BusinessReview';
import { ENTITY_META } from '@/lib/entities';
import { useFlow } from '@/store/flow';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type PhotoStatus = 'idle' | 'capturing' | 'done';
type Mcc = { code: string; title: string };

const RECOMMENDED: Mcc = { code: '5039', title: 'Construction Materials (Not Elsewhere Classified)' };
const SUGGESTIONS: Mcc[] = [
  { code: '5211', title: 'Building Materials & Lumber Stores' },
  { code: '1771', title: 'Concrete Work Contractors' },
];
const CATALOG: Mcc[] = [
  ...SUGGESTIONS,
  { code: '5032', title: 'Brick, Stone & Related Building Materials' },
  { code: '1740', title: 'Masonry, Stonework & Plastering' },
  { code: '5085', title: 'Industrial Supplies (Not Elsewhere Classified)' },
  { code: '1520', title: 'General Contractors, Residential & Commercial' },
  { code: '5099', title: 'Durable Goods, Miscellaneous' },
];

// Real captured samples for a couple of the site photos; the rest use the
// generic geotagged placeholder.
const PHOTO_IMAGES: Record<string, number> = {
  nameboard: require('../../assets/images/business-board.webp'),
  entrance: require('../../assets/images/business-board.webp'),
  inventory: require('../../assets/images/inventory.jpeg'),
};

const PHOTOS = [
  { key: 'nameboard', title: 'Business nameboard', note: 'Signage with the entity name visible', required: true },
  { key: 'entrance', title: 'Main entrance', note: 'Shopfront or premises entry', required: true },
  { key: 'inventory', title: 'Inventory / stock', note: 'Goods held on premises', required: true },
  { key: 'owner', title: 'Owner at premises', note: 'Proprietor standing at the site', required: false },
];

function Toggle<T extends string>({ value, options, onChange }: { value: T | null; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <View className="flex-row gap-2.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            className={cn('h-12 flex-1 flex-row items-center gap-2.5 rounded-xl border px-3.5', active ? 'border-blue-500 bg-blue-50' : 'border-line bg-card')}
          >
            <View className={cn('h-[18px] w-[18px] items-center justify-center rounded-full border', active ? 'border-blue-500 bg-blue-500' : 'border-line-strong')}>
              {active ? <View className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </View>
            <Txt weight={600} className={cn('text-[14px]', active ? 'text-ink' : 'text-ink-2')}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function PhotoTile({ title, note, required, status, photo, onCapture }: { title: string; note: string; required: boolean; status: PhotoStatus; photo?: number; onCapture: () => void }) {
  return (
    <View style={shadowXs} className="rounded-xl border border-line bg-card p-3">
      <View className="mb-2.5 flex-row items-start gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Txt weight={600} className="text-[14px] text-ink">
              {title}
              {required ? <Req /> : null}
            </Txt>
            {required ? null : (
              <View className="rounded bg-grey-100 px-1.5 py-0.5">
                <Txt weight={700} className="text-[10px] tracking-[0.3px] text-ink-3">
                  OPTIONAL
                </Txt>
              </View>
            )}
          </View>
          <Txt className="mt-0.5 text-[12px] text-ink-3">{note}</Txt>
        </View>
        {status === 'done' ? <Check size={20} color={C.posFg} strokeWidth={2.5} /> : null}
      </View>

      {status === 'idle' ? (
        <Pressable onPress={onCapture} className="h-[120px] items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line active:bg-grey-50">
          <Camera size={24} color={C.ink3} strokeWidth={1.75} />
          <Txt weight={600} className="text-[13px] text-ink">
            Capture photo
          </Txt>
          <Txt className="text-[11px] text-ink-3">Camera only · auto-geotagged</Txt>
        </Pressable>
      ) : status === 'capturing' ? (
        <View className="h-[120px] items-center justify-center gap-2 rounded-lg border border-line bg-grey-100">
          <ActivityIndicator color={C.brand} />
          <Txt weight={500} className="text-[13px] text-ink-2">
            Tagging location…
          </Txt>
        </View>
      ) : (
        <View>
          <View className="h-[120px] items-center justify-center overflow-hidden rounded-lg bg-[#2b3646]">
            {photo ? (
              <Image source={photo} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Camera size={28} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
            )}
            <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-1.5 bg-black/55 px-2.5 py-1.5">
              <MapPin size={14} color="#fff" strokeWidth={2} />
              <Txt weight={500} className="text-[11px] text-white/90">
                22.8394° N, 69.7219° E · 20 Jun, 2:14 AM
              </Txt>
            </View>
          </View>
          <Pressable onPress={onCapture} className="mt-2 h-9 flex-row items-center gap-1.5 self-start rounded-md border border-line bg-card px-3 active:bg-grey-50">
            <RotateCcw size={16} color={C.ink} strokeWidth={2} />
            <Txt weight={600} className="text-[13px] text-ink">
              Retake
            </Txt>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function SiteVerificationScreen() {
  const flow = useFlow();
  const meta = ENTITY_META[flow.entity];
  const [sameAddress, setSameAddress] = useState<'yes' | 'no' | null>(null);
  const [occupancy, setOccupancy] = useState<'rented' | 'owned' | null>(null);
  const [photos, setPhotos] = useState<Record<string, PhotoStatus>>({ nameboard: 'idle', entrance: 'idle', inventory: 'idle', owner: 'idle' });
  const [verify, setVerify] = useState<'idle' | 'verifying' | 'done'>('idle');
  const [reviewDone, setReviewDone] = useState(false);
  const [selected, setSelected] = useState<Mcc[]>([RECOMMENDED]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const didScrollToResult = useRef(false);

  const capture = (key: string) => {
    setPhotos((p) => ({ ...p, [key]: 'capturing' }));
    setTimeout(() => setPhotos((p) => ({ ...p, [key]: 'done' })), 900);
  };

  const photosDone = PHOTOS.filter((p) => p.required).every((p) => photos[p.key] === 'done');
  const requiredDone = photosDone && sameAddress !== null && occupancy !== null;

  const initiate = () => {
    didScrollToResult.current = false;
    setReviewDone(false);
    setVerify('verifying');
    setTimeout(() => setVerify('done'), 1600);
  };

  // The final AI review reconciles everything gathered so far.
  const entityName = meta?.legalName ?? 'Shri Shakti Properties and BMS';
  const address = meta?.registeredOffice ?? 'Survey No. 264, Village Navinal, Ta. Mundra, Dist. Kutch, Gujarat 370421';
  const reviewRows: ConsistencyRow[] = [
    { label: 'Business name', value: entityName, chip: 'Consistent' },
    { label: 'Registered address', value: address, chip: 'Consistent' },
    { label: 'Business activity', value: 'Cement manufacturing & wholesale', chip: 'Verified' },
  ];
  const reviewSources = ['MCA', 'COI', 'Factory licence', 'Business details', 'Nameboard', 'Site photos'];

  const isSelected = (code: string) => selected.some((m) => m.code === code);
  const add = (m: Mcc) => {
    setSelected((p) => (p.some((x) => x.code === m.code) ? p : [...p, m]));
    setSearchOpen(false);
    setQuery('');
  };
  const remove = (code: string) => setSelected((p) => p.filter((m) => m.code !== code));

  const suggestionsToShow = SUGGESTIONS.filter((m) => !isSelected(m.code));
  const results = CATALOG.filter((m) => !isSelected(m.code) && (m.code.includes(query) || m.title.toLowerCase().includes(query.toLowerCase())));
  const canContinue = verify === 'done' && reviewDone && selected.length > 0;

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('site')} title="Site verification & MCC" />

      <Body ref={scrollRef} className="gap-7">
        {verify !== 'done' ? (
          <>
        <View className="gap-4">
          <Eyebrow>Premises</Eyebrow>
          <View className="gap-2">
            <Txt weight={600} className="text-[14px] leading-[19px] text-ink">
              Is the registered business address the same as the permanent address?
              <Req />
            </Txt>
            <Toggle value={sameAddress} onChange={setSameAddress} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
          </View>
          <View className="gap-2">
            <Txt weight={600} className="text-[14px] leading-[19px] text-ink">
              Is the current place rented or owned?
              <Req />
            </Txt>
            <Toggle value={occupancy} onChange={setOccupancy} options={[{ value: 'rented', label: 'Rented' }, { value: 'owned', label: 'Owned' }]} />
          </View>
        </View>

        <View className="gap-3">
          <Eyebrow>Site verification photos</Eyebrow>
          <View className="gap-3">
            {PHOTOS.map((p) => (
              <PhotoTile key={p.key} title={p.title} note={p.note} required={p.required} status={photos[p.key]} photo={PHOTO_IMAGES[p.key]} onCapture={() => capture(p.key)} />
            ))}
          </View>
        </View>
          </>
        ) : null}

        {verify === 'done' ? (
          <View
            className="gap-5"
            onLayout={(e) => {
              if (didScrollToResult.current) return;
              didScrollToResult.current = true;
              const y = Math.max(0, e.nativeEvent.layout.y - 12);
              requestAnimationFrame(() => scrollRef.current?.scrollTo({ y, animated: true }));
            }}
          >
            <BusinessReview
              rows={reviewRows}
              sources={reviewSources}
              summary="Name, address and activity all reconcile across the documents, MCA and site photos. This reads as a genuine cement manufacturing and wholesale business."
              onComplete={() => setReviewDone(true)}
            />

            <View style={shadowXs} className="overflow-hidden rounded-xl border border-green-300 bg-card">
              <View className="flex-row items-center gap-2.5 border-b border-green-300 bg-green-50 px-4 py-3">
                <ShieldCheck size={20} color={C.posFg} strokeWidth={2} />
                <Txt weight={700} className="text-[14px] text-green-700">
                  Location verified · within 500 m
                </Txt>
              </View>
              <View className="gap-3 px-4 py-3">
                <View className="gap-0.5">
                  <View className="flex-row items-center gap-1.5">
                    <Txt weight={500} className="text-[12px] text-ink-3">
                      Extracted address (from MCA)
                    </Txt>
                    <Check size={13} color={C.posFg} strokeWidth={2.5} />
                  </View>
                  <Txt weight={600} className="text-[13px] leading-[18px] text-ink">
                    Survey No. 264, Village Navinal, Ta. Mundra, Dist. Kutch, Gujarat 370421
                  </Txt>
                </View>
                <View className="gap-0.5">
                  <View className="flex-row items-center gap-1.5">
                    <Txt weight={500} className="text-[12px] text-ink-3">
                      Extracted address (from documents)
                    </Txt>
                    <Check size={13} color={C.posFg} strokeWidth={2.5} />
                  </View>
                  <Txt weight={600} className="text-[13px] leading-[18px] text-ink">
                    Survey No. 264, Village Navinal, Ta. Mundra, Dist. Kutch, Gujarat 370421
                  </Txt>
                </View>
                <View className="gap-0.5">
                  <View className="flex-row items-center gap-1.5">
                    <Txt weight={500} className="text-[12px] text-ink-3">
                      Live tagged location (site photos)
                    </Txt>
                    <Check size={13} color={C.posFg} strokeWidth={2.5} />
                  </View>
                  <Txt weight={600} className="text-[13px] leading-[18px] text-ink">
                    22.8394° N, 69.7219° E · Mundra, Kutch
                  </Txt>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={14} color={C.posFg} strokeWidth={2} />
                  <Txt weight={500} className="text-[12px] text-green-700">
                    Captured ~180 m from the registered address
                  </Txt>
                </View>
              </View>
            </View>

            <View className="gap-3">
              <View className="gap-1">
                <Eyebrow>
                  Merchant category (MCC)
                  <Req />
                </Eyebrow>
                <Txt className="text-[13px] text-ink-2">AI has pre-filled the recommended MCC. Add or change it if needed.</Txt>
              </View>

              {selected.map((m) => {
                const recommended = m.code === RECOMMENDED.code;
                return (
                  <View
                    key={m.code}
                    style={shadowXs}
                    className={cn('flex-row items-start gap-3 rounded-xl border bg-card p-4', recommended ? 'border-blue-200' : 'border-line')}
                  >
                    <View className="flex-1 gap-1">
                      {recommended ? (
                        <View className="flex-row items-center gap-1.5">
                          <Sparkles size={12} color={C.brand} strokeWidth={2.5} />
                          <Txt weight={600} className="text-[10.5px] uppercase tracking-[0.5px] text-brand">
                            Recommended by AI
                          </Txt>
                        </View>
                      ) : null}
                      <Txt weight={700} className="text-[16px] tracking-[-0.2px] text-ink">
                        {m.code}
                      </Txt>
                      <Txt className="text-[13px] leading-[18px] text-ink-2">{m.title}</Txt>
                      {recommended ? (
                        <Txt weight={500} className="text-[12px] leading-[16px] text-ink-3">
                          Best fit for a cement manufacturing and wholesale business.
                        </Txt>
                      ) : null}
                    </View>
                    <Pressable onPress={() => remove(m.code)} className="h-8 w-8 items-center justify-center rounded-lg border border-line active:bg-grey-50">
                      <Trash2 size={16} color={C.ink3} strokeWidth={2} />
                    </Pressable>
                  </View>
                );
              })}

              {searchOpen ? (
                <View style={shadowXs} className="gap-2 rounded-xl border border-line bg-card p-3">
                  <View className="h-11 flex-row items-center gap-2 rounded-lg border border-line-strong bg-card px-3">
                    <Search size={16} color={C.ink3} strokeWidth={2} />
                    <TextInput
                      autoFocus
                      value={query}
                      onChangeText={setQuery}
                      placeholder="Search by MCC code or category"
                      placeholderTextColor="rgb(141,141,141)"
                      style={{ fontFamily: 'DMSans_400Regular' }}
                      className="flex-1 text-[14px] text-ink"
                    />
                    <Pressable onPress={() => setSearchOpen(false)} hitSlop={6}>
                      <X size={16} color={C.ink3} strokeWidth={2} />
                    </Pressable>
                  </View>

                  {!query && suggestionsToShow.length ? (
                    <View>
                      <Txt weight={600} className="px-1 pb-0.5 pt-1 text-[11px] uppercase tracking-[0.5px] text-ink-3">
                        Suggested by engine
                      </Txt>
                      {suggestionsToShow.map((m) => (
                        <Pressable key={m.code} onPress={() => add(m)} className="flex-row items-center gap-2 rounded-md px-1 py-2.5 active:bg-grey-50">
                          <Txt weight={600} className="text-[13px] text-ink">
                            {m.code}
                          </Txt>
                          <Txt numberOfLines={1} className="flex-1 text-[13px] text-ink-2">
                            {m.title}
                          </Txt>
                          <Plus size={16} color={C.brand} strokeWidth={2} />
                        </Pressable>
                      ))}
                    </View>
                  ) : results.length ? (
                    <View>
                      {results.map((m) => (
                        <Pressable key={m.code} onPress={() => add(m)} className="flex-row items-center gap-2 rounded-md px-1 py-2.5 active:bg-grey-50">
                          <Txt weight={600} className="text-[13px] text-ink">
                            {m.code}
                          </Txt>
                          <Txt numberOfLines={1} className="flex-1 text-[13px] text-ink-2">
                            {m.title}
                          </Txt>
                          <Plus size={16} color={C.brand} strokeWidth={2} />
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Txt className="px-1 py-2.5 text-[13px] text-ink-3">No matching MCC found.</Txt>
                  )}
                </View>
              ) : (
                <Pressable onPress={() => setSearchOpen(true)} className="h-11 flex-row items-center gap-1.5 self-start rounded-lg border border-line bg-card px-3.5 active:bg-grey-50">
                  <Plus size={16} color={C.ink} strokeWidth={2} />
                  <Txt weight={600} className="text-[14px] text-ink">
                    Add MCC
                  </Txt>
                </Pressable>
              )}
            </View>
          </View>
        ) : null}
      </Body>

      <BottomBar
        hint={
          verify === 'done' && !reviewDone ? (
            <Txt className="text-[13px] text-ink-3">Reviewing business details…</Txt>
          ) : undefined
        }
      >
        {verify === 'done' ? (
          <PrimaryCTA label="Confirm & continue" trailing={false} disabled={!canContinue} onPress={() => go('/account-setup')} />
        ) : (
          <PrimaryCTA
            label={verify === 'verifying' ? 'Verifying location & classifying…' : 'Initiate verification'}
            trailing={false}
            disabled={!requiredDone || verify === 'verifying'}
            onPress={initiate}
          />
        )}
      </BottomBar>
    </View>
  );
}

import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Upload, Eye, Check, X } from 'lucide-react-native';
import { Txt } from '../Txt';
import { cn } from '@/lib/cn';
import { C, shadowXs } from '@/lib/tokens';
import { assetFor } from '@/lib/docAssets';
import type { UploadStatus } from '@/lib/useUpload';

/* ---------------- status badge ---------------- */

export function StatusBadge({ kind }: { kind: 'verified' | 'verifying' }) {
  if (kind === 'verifying') {
    return (
      <View className="h-7 flex-row items-center gap-1.5 rounded-full bg-blue-50 px-2.5">
        <ActivityIndicator size="small" color={C.brand} />
        <Txt weight={600} className="text-[12px] text-blue-700">
          Verifying
        </Txt>
      </View>
    );
  }
  return (
    <View className="h-7 flex-row items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-2.5">
      <Check size={13} color={C.posFg} strokeWidth={2.5} />
      <Txt weight={600} className="text-[12px] text-green-700">
        Verified
      </Txt>
    </View>
  );
}

/* ---------------- faux document (fallback render) ---------------- */

function fauxHeader(v: string): [string, string] {
  const k = v.toLowerCase();
  if (k.includes('aadhaar') || k.includes('aadhar')) return ['UNIQUE IDENTIFICATION AUTHORITY', 'AADHAAR'];
  if (k.includes('pan')) return ['INCOME TAX DEPARTMENT', 'GOVT. OF INDIA'];
  if (k.includes('gst') || k.includes('vat') || k.includes('cst')) return ['GOODS & SERVICES TAX', 'GOVT. OF INDIA'];
  if (k.includes('util') || k.includes('electric')) return ['TANGEDCO', 'ELECTRICITY BILL'];
  if (k.includes('driv')) return ['TRANSPORT DEPARTMENT', 'DRIVING LICENCE'];
  if (k.includes('pass')) return ['REPUBLIC OF INDIA', 'PASSPORT'];
  if (k.includes('voter')) return ['ELECTION COMMISSION', 'VOTER ID'];
  if (k.includes('shop')) return ['MUNICIPAL CORPORATION', 'SHOPS & ESTT.'];
  if (k.includes('udyam') || k.includes('msme')) return ['MINISTRY OF MSME', 'UDYAM CERTIFICATE'];
  if (k.includes('trade')) return ['LOCAL BODY', 'TRADE LICENCE'];
  if (k.includes('statement') || k.includes('account')) return ['BANK OF INDIA', 'ACCOUNT STATEMENT'];
  return ['GOVERNMENT OF INDIA', 'VERIFIED DOCUMENT'];
}

function FauxDoc({ variant, large }: { variant: string; large?: boolean }) {
  const [left, right] = fauxHeader(variant);
  return (
    <View className={cn('w-full bg-blue-50', large ? 'p-6' : 'px-3.5 py-3')}>
      <View className="flex-row items-center justify-between">
        <Txt weight={600} className={cn('tracking-wide text-ink-2', large ? 'text-[12px]' : 'text-[9px]')}>
          {left}
        </Txt>
        <Txt weight={600} className={cn('tracking-wide text-ink-2', large ? 'text-[12px]' : 'text-[9px]')}>
          {right}
        </Txt>
      </View>
      <View className={cn('flex-row', large ? 'mt-6 gap-3' : 'mt-3.5 gap-3')}>
        <View className={cn('flex-1 pt-1', large ? 'gap-3' : 'gap-2')}>
          <View className={cn('w-3/5 rounded-sm bg-line-strong', large ? 'h-3' : 'h-2')} />
          <View className={cn('w-2/5 rounded-sm bg-line', large ? 'h-3' : 'h-2')} />
          <View className={cn('w-1/2 rounded-sm bg-line', large ? 'h-3' : 'h-2')} />
          <View className={cn('w-2/3 rounded-sm bg-line-strong', large ? 'mt-3 h-4' : 'mt-2 h-2.5')} />
        </View>
        <View className={cn('rounded border border-line bg-grey-150', large ? 'h-28 w-24' : 'h-16 w-14')} />
      </View>
    </View>
  );
}

/* ---------------- thumbnail + full render ---------------- */

export function DocThumb({ label, onView, height = 176 }: { label: string; onView: () => void; height?: number }) {
  const src = assetFor(label);
  return (
    <Pressable onPress={onView} className="w-full overflow-hidden rounded-lg border border-line">
      {src ? (
        <Image source={{ uri: src }} style={{ width: '100%', height }} contentFit="cover" contentPosition="top" />
      ) : (
        <FauxDoc variant={label} />
      )}
      <View className="absolute bottom-2.5 right-2.5 h-7 flex-row items-center gap-1.5 rounded-full bg-ink/90 px-2.5">
        <Eye size={13} color="#fff" strokeWidth={2} />
        <Txt weight={500} className="text-[12px] text-white">
          Tap to view
        </Txt>
      </View>
    </Pressable>
  );
}

function DocFull({ label }: { label: string }) {
  const src = assetFor(label);
  if (src) {
    return <Image source={{ uri: src }} style={{ width: '100%', height: 460 }} contentFit="contain" />;
  }
  return (
    <View className="w-full overflow-hidden rounded-xl border border-line">
      <FauxDoc variant={label} large />
    </View>
  );
}

export function DocViewer({
  open,
  label,
  meta,
  onClose,
}: {
  open: boolean;
  label: string;
  meta?: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80">
        <View className="flex-row items-center justify-between px-5 pb-4 pt-16">
          <View className="min-w-0 flex-1">
            <Txt weight={600} numberOfLines={1} className="text-[16px] text-white">
              {label}
            </Txt>
            {meta ? (
              <Txt mono numberOfLines={1} className="text-[13px] text-white/60">
                {meta}
              </Txt>
            ) : null}
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
          >
            <X size={20} color="#fff" strokeWidth={2} />
          </Pressable>
        </View>
        <ScrollView contentContainerClassName="flex-grow items-center justify-center px-5 py-6">
          <DocFull label={label} />
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------------- upload tiles ---------------- */

export function Dropzone({
  title,
  hint,
  onPick,
  dense,
}: {
  title: string;
  hint: string;
  onPick: () => void;
  dense?: boolean;
}) {
  return (
    <Pressable
      onPress={onPick}
      className={cn(
        'w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line active:bg-grey-50',
        dense ? 'px-4 py-7' : 'px-4 py-10',
      )}
    >
      <Upload size={24} color={C.ink3} strokeWidth={1.75} />
      <Txt weight={600} className="text-[15px] text-ink">
        {title}
      </Txt>
      <Txt className="text-[13px] text-ink-3">{hint}</Txt>
    </Pressable>
  );
}

export function ProcessingTile({
  status,
  label,
  dense,
}: {
  status: UploadStatus | string;
  label: string;
  dense?: boolean;
}) {
  const text = status === 'uploading' ? `Uploading ${label}…` : `Verifying ${label}…`;
  return (
    <View
      style={shadowXs}
      className={cn(
        'w-full items-center justify-center gap-3 rounded-xl border border-line bg-card',
        dense ? 'px-4 py-7' : 'px-4 py-10',
      )}
    >
      <ActivityIndicator color={C.brand} />
      <Txt weight={500} className="text-[14px] text-ink-2">
        {text}
      </Txt>
    </View>
  );
}

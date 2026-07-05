import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Zap, RotateCw, Check, Camera, Lock, ScanFace, RefreshCw } from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { SELFIE } from '@/lib/docAssets';

type Phase = 'searching' | 'aligned' | 'captured';

/**
 * Live selfie / liveness capture flow (searching → aligned → captured).
 * Presentational + self-contained: renders as a full-screen surface, so it
 * works both as a route screen and inside a full-screen Modal. Reused by the
 * sole-prop journey and each signatory card in Signatory KYC.
 */
export function SelfieCapture({
  subjectName,
  onUse,
  onClose,
  useLabel = 'Use this photo',
}: {
  subjectName: string;
  onUse: () => void;
  onClose: () => void;
  useLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('searching');
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (phase !== 'searching') return;
    timer.current = setTimeout(() => setPhase('aligned'), 2400);
    return () => clearTimeout(timer.current);
  }, [phase]);

  const capture = () => {
    if (phase !== 'aligned') return;
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    setPhase('captured');
  };

  const ovalColor = phase === 'searching' ? '#f5a623' : '#16a34a';

  return (
    <View className="flex-1 bg-[#0b0f1a]" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View className="z-20 flex-row items-center gap-3 px-4 pb-3 pt-4">
        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="-ml-1 h-9 w-9 items-center justify-center rounded-full active:bg-white/10"
        >
          <ChevronLeft size={22} color="#fff" strokeWidth={2} />
        </Pressable>
        <View>
          <Txt weight={600} className="text-[16px] text-white">
            Selfie verification
          </Txt>
          <Txt className="text-[12px] text-white/60">Capturing for · {subjectName}</Txt>
        </View>
      </View>

      <View className="z-20 px-6 pb-2">
        <Txt className="text-center text-[13.5px] text-white/65">
          Ask the customer to look straight into the camera and hold still.
        </Txt>
      </View>

      {/* Camera viewport */}
      <View className="relative flex-1">
        <Image source={{ uri: SELFIE }} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" contentPosition="top" />

        {/* Oval guide */}
        <View className="absolute inset-0 items-center justify-center" style={{ paddingBottom: '10%' }}>
          <View style={{ width: 244, height: 312 }}>
            <View style={{ borderRadius: 156, borderWidth: 4, borderColor: ovalColor, width: 244, height: 312 }} />
            {phase !== 'searching' ? (
              <View
                style={{ backgroundColor: '#16a34a' }}
                className="absolute -bottom-3 left-1/2 -ml-4 h-8 w-8 items-center justify-center rounded-full"
              >
                <Check size={20} color="#fff" strokeWidth={3} />
              </View>
            ) : null}
          </View>
        </View>

        {/* Status pill */}
        <View className="absolute inset-x-0 bottom-6 items-center px-6">
          {phase === 'searching' ? (
            <View className="h-10 flex-row items-center gap-2 rounded-full bg-black/55 px-4">
              <ScanFace size={16} color="#fbbf24" strokeWidth={2} />
              <Txt weight={500} className="text-[14px] text-[#fbbf24]">
                Position the face inside the oval
              </Txt>
            </View>
          ) : (
            <View className="h-10 flex-row items-center gap-2 rounded-full bg-black/55 px-4">
              <Check size={16} color="#4ade80" strokeWidth={2.5} />
              <Txt weight={600} className="text-[14px] text-[#4ade80]">
                {phase === 'aligned' ? 'Face detected, hold still' : 'Photo captured'}
              </Txt>
            </View>
          )}
        </View>

        {flash ? <View className="absolute inset-0 bg-white" style={{ opacity: 0.85 }} /> : null}
      </View>

      {/* Bottom controls */}
      <View className="z-20 px-6 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        {phase === 'captured' ? (
          <View className="gap-3">
            <Pressable
              onPress={onUse}
              className="h-13 flex-row items-center justify-center gap-2 rounded-xl bg-white py-3.5 active:opacity-90"
            >
              <Check size={18} color="#0b0f1a" strokeWidth={2.5} />
              <Txt weight={600} className="text-[15px] text-[#0b0f1a]">
                {useLabel}
              </Txt>
            </Pressable>
            <Pressable
              onPress={() => setPhase('searching')}
              className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-white/20 py-3 active:bg-white/10"
            >
              <RefreshCw size={18} color="#fff" strokeWidth={2} />
              <Txt weight={600} className="text-[15px] text-white">
                Retake
              </Txt>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Zap size={20} color="rgba(255,255,255,0.8)" strokeWidth={1.75} />
            </View>
            <Pressable
              onPress={capture}
              disabled={phase !== 'aligned'}
              className="h-[74px] w-[74px] items-center justify-center rounded-full active:opacity-80"
              style={{ borderWidth: 3, borderColor: phase === 'aligned' ? '#16a34a' : 'rgba(255,255,255,0.4)' }}
            >
              <View
                className="h-[56px] w-[56px] items-center justify-center rounded-full"
                style={{ backgroundColor: phase === 'aligned' ? '#16a34a' : 'rgba(255,255,255,0.35)' }}
              >
                <Camera size={24} color="#fff" strokeWidth={2} />
              </View>
            </Pressable>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <RotateCw size={20} color="rgba(255,255,255,0.8)" strokeWidth={1.75} />
            </View>
          </View>
        )}

        <View className="mt-5 flex-row items-center justify-center gap-1.5">
          <Lock size={12} color="rgba(255,255,255,0.4)" strokeWidth={2} />
          <Txt className="text-[11px] text-white/40">Encrypted · matched against PAN & address proof</Txt>
        </View>
      </View>
    </View>
  );
}

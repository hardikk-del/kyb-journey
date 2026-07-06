import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowRight, Check, Download, X } from 'lucide-react-native';
import { Txt } from '../Txt';
import { Button } from '../Button';

// The board resolution the platform assembles from the RM's answers, injected
// into ICICI's CA-5 template and rendered as Board_Resolution_FILLED.pdf.
const PAGES = [
  require('../../../assets/images/board-resolution-p1.png'),
  require('../../../assets/images/board-resolution-p2.png'),
];
const PAGE_RATIO = 1591 / 2059;

/** Full-screen preview of the generated Board_Resolution_FILLED.pdf. */
export function ResolutionPreview({
  open,
  onClose,
  onContinue,
  onDownload,
}: {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onDownload?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/85">
        {/* header */}
        <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center gap-3 px-5 pb-4">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-5 flex-row items-center gap-1 rounded-full bg-green-500 px-2">
                <Check size={11} color="#fff" strokeWidth={3} />
                <Txt weight={700} className="text-[10px] uppercase tracking-[0.4px] text-white">
                  Generated
                </Txt>
              </View>
            </View>
            <Txt weight={600} mono numberOfLines={1} className="mt-1 text-[14px] text-white">
              Board_Resolution_FILLED.pdf
            </Txt>
          </View>
          {onDownload ? (
            <Pressable onPress={onDownload} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20">
              <Download size={18} color="#fff" strokeWidth={2} />
            </Pressable>
          ) : null}
          <Pressable onPress={onClose} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20">
            <X size={20} color="#fff" strokeWidth={2} />
          </Pressable>
        </View>

        {/* pages */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="items-center gap-4 px-4 pt-1"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 84 }}
          showsVerticalScrollIndicator={false}
        >
          {PAGES.map((src, i) => (
            <View key={i} className="w-full overflow-hidden rounded-lg bg-white" style={{ aspectRatio: PAGE_RATIO }}>
              <Image source={src} style={{ width: '100%', height: '100%' }} contentFit="contain" />
            </View>
          ))}
        </ScrollView>

        {/* footer — pinned to the bottom of the viewport so it's always visible */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black px-5 pt-3"
        >
          <Button
            label="Continue"
            fullWidth
            onPress={onContinue}
            trailingIcon={<ArrowRight size={18} color="#fff" />}
            className="bg-blue-500 active:bg-blue-600"
          />
        </View>
      </View>
    </Modal>
  );
}

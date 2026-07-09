import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarClock, MessageCircle } from 'lucide-react-native';

import { Txt } from '../Txt';
import { Button } from '../Button';
import { C } from '@/lib/tokens';

/**
 * Confirmation sheet shown when the RM chooses to upload a business-proof
 * document later. Communicates the 7-day window and that an agent will reach
 * out on WhatsApp to collect it, then lets them proceed.
 */
export function UploadLaterSheet({
  open,
  docLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  docLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        {/* Tap outside to dismiss */}
        <Pressable className="flex-1" onPress={onClose} />

        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="rounded-t-2xl border-t border-line bg-card px-5 pt-5"
        >
          <View className="items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <CalendarClock size={22} color={C.amberFg} strokeWidth={2} />
            </View>
            <Txt weight={700} className="mt-3.5 text-[18px] tracking-[-0.2px] text-ink">
              Upload within 7 days
            </Txt>
            <Txt className="mt-1.5 max-w-[320px] text-center text-[14px] leading-[20px] text-ink-2">
              An agent will reach out on WhatsApp to collect your{' '}
              <Txt weight={600} className="text-ink">
                {docLabel}
              </Txt>
              . You can continue with your application for now.
            </Txt>
          </View>

          <View className="mt-4 flex-row items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
            <MessageCircle size={15} color={C.amberFg} strokeWidth={2} style={{ marginTop: 1 }} />
            <Txt className="flex-1 text-[12.5px] leading-[17px] text-amber-700">
              Your application won't be completed until this document is received. Please share it
              within 7 days.
            </Txt>
          </View>

          <View className="mt-5 gap-2.5">
            <Button label="Skip & continue" fullWidth onPress={onConfirm} />
            <Button label="Cancel" variant="secondary" fullWidth onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

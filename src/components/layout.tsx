import { forwardRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { Txt } from './Txt';
import { Button } from './Button';
import { cn } from '@/lib/cn';

interface ScreenHeaderProps {
  title: string;
  /** Eyebrow above the title, e.g. "STEP 1 OF 9". */
  stepLabel?: string;
  /** Progress bar fill, 0–100. */
  progress?: number;
  showBack?: boolean;
  onBack?: () => void;
}

/** Top progress line + step eyebrow + title + back chevron. */
export function ScreenHeader({ title, stepLabel, progress = 0, showBack = true, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <View style={{ paddingTop: insets.top }} className="border-b border-line bg-card">
      <View className="h-[3px] bg-grey-150">
        <View className="h-full rounded-r-xs bg-blue-500" style={{ width: `${pct}%` }} />
      </View>
      <View className="flex-row items-center gap-2.5 px-3.5 py-2.5">
        {showBack ? (
          <Pressable
            onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={8}
            className="-ml-1 h-9 w-9 items-center justify-center rounded-md active:bg-grey-100"
          >
            <ChevronLeft size={20} color="rgb(73, 73, 73)" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          {stepLabel ? (
            <Txt weight={600} className="text-[10.5px] uppercase tracking-[0.5px] text-ink-3">
              {stepLabel}
            </Txt>
          ) : null}
          <Txt weight={700} numberOfLines={1} className="text-[16px] tracking-[-0.3px] text-ink">
            {title}
          </Txt>
        </View>
      </View>
    </View>
  );
}

export const Body = forwardRef<
  ScrollView,
  {
    children: React.ReactNode;
    className?: string;
    onContentSizeChange?: (w: number, h: number) => void;
  }
>(({ children, className, onContentSizeChange }, ref) => {
  return (
    <ScrollView
      ref={ref}
      className="flex-1 bg-page"
      contentContainerClassName={cn('gap-6 px-5 pb-6 pt-6', className)}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      onContentSizeChange={onContentSizeChange}
    >
      {children}
    </ScrollView>
  );
});
Body.displayName = 'Body';

export function BottomBar({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      className="border-t border-line bg-card px-5 pt-3"
    >
      {hint ? <View className="mb-2.5 items-center justify-center">{hint}</View> : null}
      <View className="flex-row">{children}</View>
    </View>
  );
}

export function PrimaryCTA({
  label,
  onPress,
  disabled,
  trailing = true,
  leadingIcon,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  trailing?: boolean;
  leadingIcon?: React.ReactNode;
}) {
  return (
    <Button
      label={label}
      onPress={onPress}
      disabled={disabled}
      fullWidth
      leadingIcon={leadingIcon}
      trailingIcon={trailing && !disabled && !leadingIcon ? <ArrowRight size={18} color="#fff" /> : undefined}
    />
  );
}

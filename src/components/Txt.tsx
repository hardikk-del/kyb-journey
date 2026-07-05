import { Text, type TextProps } from 'react-native';
import { cn } from '@/lib/cn';

type Weight = 400 | 500 | 600 | 700;

const SANS: Record<Weight, string> = {
  400: 'DMSans_400Regular',
  500: 'DMSans_500Medium',
  600: 'DMSans_600SemiBold',
  700: 'DMSans_700Bold',
};

interface TxtProps extends TextProps {
  /** DM Sans weight; ignored when `mono` is set. */
  weight?: Weight;
  mono?: boolean;
  className?: string;
}

/**
 * Text with the Cashfree type system baked in. RN needs an explicit family per
 * weight for custom fonts, so weight maps to a DM Sans family; color/size come
 * from NativeWind classes.
 */
export function Txt({ weight = 400, mono, className, style, ...rest }: TxtProps) {
  const family = mono ? 'DMMono_400Regular' : SANS[weight];
  return (
    <Text
      {...rest}
      style={[{ fontFamily: family }, style]}
      className={cn('text-ink', className)}
    />
  );
}

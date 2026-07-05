import { Pressable, View, type PressableProps } from 'react-native';
import { Txt } from './Txt';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary';
type Size = 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const HEIGHT: Record<Size, string> = { medium: 'h-10', large: 'h-12' };

export function Button({
  label,
  variant = 'primary',
  size = 'large',
  fullWidth,
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const primary = variant === 'primary';
  const surface = disabled
    ? 'bg-line-strong'
    : primary
      ? 'bg-ink active:bg-grey-900'
      : 'border border-line-strong bg-card active:bg-grey-100';
  const textColor = disabled ? 'text-white' : primary ? 'text-white' : 'text-ink';
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-lg px-4',
        HEIGHT[size],
        fullWidth && 'flex-1',
        surface,
        className,
      )}
    >
      {leadingIcon}
      <Txt weight={600} className={cn('text-[15px]', textColor)}>
        {label}
      </Txt>
      {trailingIcon}
    </Pressable>
  );
}

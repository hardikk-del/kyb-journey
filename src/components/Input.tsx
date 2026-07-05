import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Txt } from './Txt';
import { cn } from '@/lib/cn';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  mono?: boolean;
}

export function Input({ label, helper, required, prefix, mono, className, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      {label ? (
        <Txt weight={600} className="mb-1.5 text-[13px] text-ink">
          {label}
          {required ? <Txt className="text-red-500"> *</Txt> : null}
        </Txt>
      ) : null}
      <View
        className={cn(
          'h-12 flex-row items-center rounded-lg border bg-card px-3',
          focused ? 'border-blue-500' : 'border-line-strong',
        )}
      >
        {prefix ? <View className="mr-2.5 flex-row items-center">{prefix}</View> : null}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor="rgb(141, 141, 141)"
          style={{ fontFamily: mono ? 'DMMono_400Regular' : 'DMSans_500Medium' }}
          className={cn('flex-1 text-[15px] text-ink', className)}
        />
      </View>
      {helper ? <Txt className="mt-1.5 text-[12px] text-ink-3">{helper}</Txt> : null}
    </View>
  );
}

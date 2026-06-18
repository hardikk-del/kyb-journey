import { forwardRef, useId } from 'react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/* ---------- label + helper/error wrapper ---------- */

export interface FieldShellProps {
  label?: React.ReactNode
  /** Inline helper text shown when there's no error. */
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export function FieldShell({ label, hint, error, children, htmlFor, className }: FieldShellProps) {
  return (
    <div className={cn('block', className)}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-label text-ink-2">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-caption text-risk">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  )
}

/* ---------- text input ---------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  /** Render value in mono (for IDs / amounts). */
  mono?: boolean
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, mono, className, containerClassName, id, ...rest },
  ref,
) {
  const auto = useId()
  const fieldId = id ?? auto
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={fieldId} className={containerClassName}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-input w-full rounded-md border bg-surface px-3 text-[16px] text-ink placeholder:text-ink-3',
          'outline-none transition-colors duration-120',
          'focus:border-brand-500',
          error ? 'border-risk' : 'border-line-strong',
          mono && 'font-mono tnum',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  )
})

/* ---------- select (Radix) ---------- */

export interface SelectFieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  className?: string
}

export function SelectField({
  label,
  hint,
  error,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  options,
  className,
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      <Select.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <Select.Trigger
          className={cn(
            'flex h-input w-full items-center justify-between rounded-md border bg-surface px-3 text-[16px] text-ink',
            'outline-none transition-colors duration-120 focus:border-brand-500 data-[placeholder]:text-ink-3',
            error ? 'border-risk' : 'border-line-strong',
          )}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-surface shadow-popover"
          >
            <Select.Viewport className="p-1">
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  className="flex h-9 cursor-pointer items-center justify-between rounded-sm px-2 text-c-body text-ink outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700"
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4 text-brand-600" strokeWidth={2} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </FieldShell>
  )
}

/* ---------- segmented radio (entity type, yes/no) ---------- */

export interface SegmentedProps {
  value?: string
  onValueChange?: (v: string) => void
  options: { value: string; label: string }[]
  /** Stack as full-width rows instead of a wrap row. */
  ariaLabel?: string
  className?: string
}

export function Segmented({ value, onValueChange, options, ariaLabel, className }: SegmentedProps) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      aria-label={ariaLabel}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((o) => (
        <RadioGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            'min-h-touch rounded-md border px-4 text-[14px] font-medium text-ink-2 transition-colors duration-120',
            'border-line-strong hover:bg-sunken',
            'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-50 data-[state=checked]:text-brand-700',
          )}
        >
          {o.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}

/* ---------- choice cards (radio list with description) ---------- */

export interface ChoiceCardsProps {
  value?: string
  onValueChange?: (v: string) => void
  options: { value: string; title: React.ReactNode; description?: React.ReactNode }[]
  ariaLabel?: string
  className?: string
}

export function ChoiceCards({ value, onValueChange, options, ariaLabel, className }: ChoiceCardsProps) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      aria-label={ariaLabel}
      className={cn('space-y-2', className)}
    >
      {options.map((o) => (
        <RadioGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            'flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors duration-120',
            'border-line-strong hover:bg-sunken',
            'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-50',
          )}
        >
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong data-[state=checked]:border-brand-600">
            <RadioGroup.Indicator className="h-2 w-2 rounded-full bg-brand-600" />
          </span>
          <span className="flex-1">
            <span className="block text-c-body font-medium text-ink">{o.title}</span>
            {o.description && <span className="mt-0.5 block text-caption text-ink-3">{o.description}</span>}
          </span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}

/* ---------- checkbox ---------- */

export interface CheckFieldProps {
  checked?: boolean
  onCheckedChange?: (v: boolean) => void
  children: React.ReactNode
  className?: string
}

export function CheckField({ checked, onCheckedChange, children, className }: CheckFieldProps) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md border border-line p-3',
        className,
      )}
    >
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface outline-none data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600"
      >
        <Checkbox.Indicator>
          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <span className="text-c-body text-ink-2">{children}</span>
    </label>
  )
}

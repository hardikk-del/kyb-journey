import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'md' | 'sm'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** Full-width-ish: used for the phone bottom action bar. */
  block?: boolean
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-sunken disabled:text-ink-3',
  ghost: 'bg-transparent text-ink-2 hover:bg-sunken disabled:text-ink-3',
  destructive: 'bg-risk text-white hover:brightness-95 disabled:bg-risk/50',
}

const SIZE: Record<Size, string> = {
  md: 'h-touch px-4 text-[14px]',
  sm: 'h-9 px-3 text-[13px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, block, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-120 select-none',
        'disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />}
      {children}
    </button>
  )
})

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  formatPAN,
  formatGSTIN,
  formatCIN,
  formatId,
  maskAccount,
} from '@/lib/format'

export type IdKind = 'PAN' | 'GSTIN' | 'CIN' | 'LLPIN' | 'Udyam' | 'DIN' | 'IFSC' | 'Account'

const FORMATTER: Record<IdKind, (v: string) => string> = {
  PAN: formatPAN,
  GSTIN: formatGSTIN,
  CIN: formatCIN,
  LLPIN: formatId,
  Udyam: formatId,
  DIN: formatId,
  IFSC: formatId,
  Account: (v) => maskAccount(v),
}

export interface IdChipProps {
  kind: IdKind
  value: string
  /** Show the "PAN" / "GSTIN" label before the value. */
  showLabel?: boolean
  className?: string
}

/** Mono, tabular ID on a sunken surface, copyable. The display is grouped; the
 *  copied value is the raw, ungrouped identifier. */
export function IdChip({ kind, value, showLabel = true, className }: IdChipProps) {
  const [copied, setCopied] = useState(false)
  const display = FORMATTER[kind](value)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard blocked in some sandboxes — silently no-op */
    }
  }

  return (
    <span
      className={cn(
        'group inline-flex items-center gap-2 rounded-md bg-sunken px-2 py-1',
        className,
      )}
    >
      {showLabel && (
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">{kind}</span>
      )}
      <span className="font-mono text-c-mono tnum text-ink">{display}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : `Copy ${kind}`}
        className="text-ink-3 opacity-0 transition-opacity duration-120 hover:text-ink-2 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-ok" strokeWidth={2} />
        ) : (
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>
    </span>
  )
}

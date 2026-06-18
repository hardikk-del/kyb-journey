import { cn } from '@/lib/cn'
import { riskBandMeta, toneClasses, type RiskBand } from '@/lib/status'

export interface RiskGaugeProps {
  /** 0–100 composite score. */
  score: number
  band: RiskBand
  /** px diameter. */
  size?: number
  /** Render as provisional (still verifying) — dashed, muted. */
  provisional?: boolean
  className?: string
}

const TONE_STROKE: Record<RiskBand, string> = {
  low: 'var(--ok)',
  medium: 'var(--warn)',
  high: 'var(--risk)',
}

/**
 * A 270° arc gauge. The track is neutral; the value arc is the band color.
 * Animation of the sweep is handled by the Verify screen (signature moment #1);
 * this primitive renders a given score statically and respects reduced motion.
 */
export function RiskGauge({ score, band, size = 160, provisional, className }: RiskGaugeProps) {
  const stroke = 10
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const arc = 270 // degrees swept (rotation handled by the -rotate utility)
  const circumference = 2 * Math.PI * r
  const arcLen = (arc / 360) * circumference
  const valueLen = (Math.min(100, Math.max(0, score)) / 100) * arcLen
  const meta = riskBandMeta(band)
  const tone = toneClasses(meta.tone)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[225deg]" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--surface-sunken)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${circumference}`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={TONE_STROKE[band]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${valueLen} ${circumference}`}
          opacity={provisional ? 0.45 : 1}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-mono text-[34px] leading-none tnum', tone.text)}>{score}</span>
        <span className="mt-1 text-caption uppercase tracking-wide text-ink-3">
          {provisional ? 'Provisional' : `${meta.label} risk`}
        </span>
      </div>
    </div>
  )
}

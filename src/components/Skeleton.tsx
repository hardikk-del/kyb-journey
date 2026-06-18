import { cn } from '@/lib/cn'

export interface SkeletonProps {
  className?: string
}

/** Subtle pulse on a sunken surface — skeletons, never spinners on blank screens. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-sm bg-sunken', className)} aria-hidden />
}

/** A few stacked lines, for text blocks. */
export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

import * as RadixTooltip from '@radix-ui/react-tooltip'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltip.Provider delayDuration={200}>{children}</RadixTooltip.Provider>
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-[240px] rounded-md bg-ink px-2.5 py-1.5 text-caption text-white shadow-popover data-[state=delayed-open]:animate-[fade_120ms_ease]"
        >
          {content}
          <RadixTooltip.Arrow className="fill-ink" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

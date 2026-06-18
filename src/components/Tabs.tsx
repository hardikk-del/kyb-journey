import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/cn'

export interface TabsProps {
  tabs: { value: string; label: React.ReactNode }[]
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ tabs, value, defaultValue, onValueChange, children, className }: TabsProps) {
  return (
    <RadixTabs.Root
      value={value}
      defaultValue={defaultValue ?? tabs[0]?.value}
      onValueChange={onValueChange}
      className={className}
    >
      <RadixTabs.List className="flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className={cn(
              '-mb-px border-b-2 border-transparent px-3 py-2 text-c-body font-medium text-ink-3 transition-colors duration-120',
              'hover:text-ink-2',
              'data-[state=active]:border-brand-600 data-[state=active]:text-brand-700',
            )}
          >
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export const TabPanel = RadixTabs.Content

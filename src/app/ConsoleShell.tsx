import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ListChecks,
  Activity,
  SlidersHorizontal,
  Smartphone,
  Search,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV: NavItem[] = [
  { to: '/console', label: 'Pipeline', icon: LayoutDashboard },
  { to: '/console/applications', label: 'Applications', icon: ListChecks },
  { to: '/console/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/console/admin', label: 'Admin', icon: SlidersHorizontal },
]

export interface ConsoleShellProps {
  /** Breadcrumb trail (last item is the current page). */
  breadcrumbs?: { label: string; to?: string }[]
  /** Right-aligned topbar slot (e.g. role switcher). */
  topbarRight?: React.ReactNode
  children: React.ReactNode
}

/** Desktop operations shell: 240px left nav, 56px topbar with breadcrumbs and a
 *  role switcher, disciplined max-width content. Not a centered column. */
export function ConsoleShell({ breadcrumbs, topbarRight, children }: ConsoleShellProps) {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-paper">
      {/* sidebar */}
      <aside className="hidden w-sidebar shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-topbar items-center border-b border-line px-4">
          <span className="text-c-h1 font-semibold tracking-tight text-ink">
            Secure<span className="text-brand-600">ID</span>
          </span>
        </div>

        <NavLink
          to="/onboarding"
          className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-line px-3 py-2 text-c-body text-ink-2 hover:bg-sunken"
        >
          <Smartphone className="h-4 w-4" strokeWidth={1.75} />
          Onboarding app
        </NavLink>

        <nav className="mt-3 flex flex-col gap-0.5 px-3">
          <div className="px-2 pb-1 pt-2 text-c-table uppercase tracking-wide text-ink-3">Console</div>
          {NAV.map((item) => {
            const active = item.to === '/console' ? pathname === item.to : pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/console'}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-c-body transition-colors duration-120',
                  active
                    ? 'bg-brand-50 font-medium text-brand-600'
                    : 'text-ink-2 hover:bg-sunken',
                )}
              >
                {active && (
                  <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand-600" aria-hidden />
                )}
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto p-3">
          <div className="rounded-md bg-sunken px-3 py-2 text-caption text-ink-3">
            Prototype · front-end only · no real data
          </div>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-topbar shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-6">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-c-body">
            {(breadcrumbs ?? [{ label: 'Pipeline' }]).map((b, i, arr) => (
              <span key={i} className="flex min-w-0 items-center gap-1.5">
                {b.to && i < arr.length - 1 ? (
                  <NavLink to={b.to} className="truncate text-ink-3 hover:text-ink-2">
                    {b.label}
                  </NavLink>
                ) : (
                  <span className={cn('truncate', i === arr.length - 1 ? 'text-ink' : 'text-ink-3')}>
                    {b.label}
                  </span>
                )}
                {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.75} />}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-c-body text-ink-3 md:flex">
              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Search</span>
            </div>
            <span className="rounded-full bg-sunken px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
              Demo data
            </span>
            {topbarRight}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-content p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

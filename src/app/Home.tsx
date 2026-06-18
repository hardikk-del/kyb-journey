import { Link } from 'react-router-dom'
import { Smartphone, LayoutDashboard, Component, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Dest {
  to: string
  title: string
  body: string
  icon: typeof Smartphone
}

const DESTS: Dest[] = [
  {
    to: '/onboarding',
    title: 'Onboarding app',
    body: 'Phone-first capture → verify → decision → account → deploy → activate.',
    icon: Smartphone,
  },
  {
    to: '/console',
    title: 'Bank console',
    body: 'Desktop ops surface: pipeline, case detail, ownership graph, decisioning.',
    icon: LayoutDashboard,
  },
  {
    to: '/kitchen-sink',
    title: 'Kitchen sink',
    body: 'The design system — tokens, primitives, and every component state.',
    icon: Component,
  },
]

/** Demo launcher. Not a marketing page — a plain index into the two surfaces
 *  plus the design system. */
export function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="flex items-center justify-between">
          <span className="text-c-page font-semibold tracking-tight text-ink">
            Secure<span className="text-brand-600">ID</span>
          </span>
          <span className="rounded-full bg-sunken px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
            Demo data
          </span>
        </div>
        <p className="mt-2 max-w-xl text-body text-ink-2">
          Verification infrastructure you can trust — assisted onboarding, KYB, current-account
          opening, POS/QR deployment and monitoring for Indian banks.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTS.map((d) => {
            const Icon = d.icon
            return (
              <Link
                key={d.to}
                to={d.to}
                className={cn(
                  'group flex flex-col rounded-md border border-line bg-surface p-5 transition-colors duration-120 hover:border-line-strong',
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h2 className="mt-4 text-c-h1 text-ink">{d.title}</h2>
                <p className="mt-1 flex-1 text-c-body text-ink-3">{d.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-c-body font-medium text-brand-600">
                  Open
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-120 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: React.ReactNode
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode
  /** Right-align (numbers/IDs). */
  align?: 'left' | 'right'
  /** Sort accessor; presence makes the column sortable. */
  sortValue?: (row: T) => string | number
  className?: string
  /** Header width hint, e.g. 'w-32'. */
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  loading?: boolean
  /** Shown when there are no rows (and not loading). */
  empty?: React.ReactNode
  className?: string
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  empty,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const acc = col.sortValue
    return [...rows].sort((a, b) => {
      const av = acc(a)
      const bv = acc(b)
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, sort, columns])

  function toggleSort(key: string) {
    setSort((s) =>
      s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' },
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-line bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-sunken/60">
              {columns.map((c) => {
                const active = sort?.key === c.key
                return (
                  <th
                    key={c.key}
                    className={cn(
                      'h-10 px-3 text-c-table uppercase tracking-wide text-ink-3',
                      c.align === 'right' ? 'text-right' : 'text-left',
                      c.width,
                    )}
                  >
                    {c.sortValue ? (
                      <button
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-ink-2',
                          c.align === 'right' && 'flex-row-reverse',
                          active && 'text-ink-2',
                        )}
                      >
                        {c.header}
                        {active ? (
                          sort!.dir === 'asc' ? (
                            <ChevronUp className="h-3 w-3" strokeWidth={2} />
                          ) : (
                            <ChevronDown className="h-3 w-3" strokeWidth={2} />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" strokeWidth={2} />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="h-11 px-3">
                      <Skeleton className="h-3.5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {empty ?? <EmptyState title="Nothing here yet." className="border-0" />}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-line last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-brand-50/40',
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'h-11 px-3 text-c-body text-ink',
                        c.align === 'right' && 'text-right font-mono tnum',
                        c.className,
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

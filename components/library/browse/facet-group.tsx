import Link from 'next/link'
import type { FacetOption } from '@/components/library/browse/facets'
import {
  buildHref, isExpanded, toggleParam, withExpanded, withoutExpanded, type Params,
} from '@/components/library/browse/url'

/*
  One dimension of the rail.

  Every option is a link back to this same page with the param added or
  removed, which is the whole interaction model: no client state, no form, and
  a filtered view that can be pasted to somebody else.

  The long groups do not list flat. There are 152 topics and 61 doctrines, and
  a rail that dumps all of them is a wall, not a control. The head of the list
  by count is shown, the tail sits behind a disclosure, and the disclosure
  itself is a search param so opening it and then picking something does not
  slam the list shut behind you.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function FacetGroup({
  label, name, options, params, active, head, expandable = false,
}: {
  label: string
  /** The search param this group writes, which is also its disclosure key. */
  name: string
  options: FacetOption[]
  params: Params
  active?: string
  /** How many options to show before the disclosure. */
  head?: number
  expandable?: boolean
}) {
  const usable = options.filter(o => o.count > 0 || o.slug === active)
  if (!usable.length) return null

  const open = expandable && isExpanded(params, name)
  const overflows = expandable && head != null && usable.length > head

  let shown: FacetOption[]
  if (!overflows || open) {
    // Opened, the group is for finding a specific thing, so it reads A to Z.
    shown = open ? [...usable].sort((a, b) => a.name.localeCompare(b.name)) : usable
  } else {
    // Closed, the group is for finding the big thing, so it keeps count order.
    shown = usable.slice(0, head)
    if (active && !shown.some(o => o.slug === active)) {
      const activeOption = usable.find(o => o.slug === active)
      if (activeOption) shown = [activeOption, ...shown.slice(0, Math.max(0, (head ?? 1) - 1))]
    }
  }

  return (
    <div className="min-w-0">
      <p
        className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
      >
        {label}
      </p>

      <ul
        className="min-w-0 space-y-px"
        style={open ? { maxHeight: '20rem', overflowY: 'auto' } : undefined}
      >
        {shown.map(option => {
          const on = option.slug === active
          const href = buildHref(toggleParam(params, name, option.slug))
          return (
            <li key={option.slug} className="min-w-0">
              <Link
                href={href}
                aria-current={on ? 'true' : undefined}
                className="flex min-w-0 items-baseline justify-between gap-2 py-[3px] pl-2.5 text-[0.8rem] leading-snug transition-colors"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: on ? 'var(--awd-gold)' : 'rgba(238,234,225,0.68)',
                  borderLeft: on ? '2px solid var(--awd-gold)' : '2px solid transparent',
                }}
              >
                <span className="min-w-0 flex-1 ">{option.name}</span>
                <span
                  className="shrink-0 text-[0.66rem] tabular-nums"
                  style={{ color: on ? 'var(--awd-gold)' : 'var(--awd-stone)', opacity: on ? 1 : 0.7 }}
                >
                  {option.count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {overflows && (
        <Link
          href={buildHref(open ? withoutExpanded(params, name) : withExpanded(params, name))}
          className="mt-2 inline-block pl-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--awd-gold)]"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
        >
          {open ? 'Show fewer' : `Show all ${usable.length}`}
        </Link>
      )}
    </div>
  )
}

import Link from 'next/link'
import { buildHref, withParam, withoutParam, type Params } from '@/components/library/browse/url'

/*
  Sorting is links, not a select.

  A select needs client state and a change handler to do anything, and it
  cannot be shared. Four links cost nothing and every one of them is a real
  address. Newest is the default, so choosing it drops the param rather than
  writing sort=newest into an otherwise clean URL.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export const SORTS = [
  { slug: 'newest', label: 'Newest' },
  { slug: 'oldest', label: 'Oldest' },
  { slug: 'title', label: 'A to Z' },
  { slug: 'episode', label: 'By episode' },
] as const

export default function SortLinks({ params, active }: { params: Params; active: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span
        className="text-[0.6rem] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
      >
        Sort
      </span>
      {SORTS.map(sort => {
        const on = sort.slug === active
        const next = sort.slug === 'newest'
          ? withoutParam(params, 'sort')
          : withParam(params, 'sort', sort.slug)
        return (
          <Link
            key={sort.slug}
            href={buildHref(next)}
            aria-current={on ? 'true' : undefined}
            className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-[var(--awd-gold)]"
            style={{
              fontFamily: HEADING,
              color: on ? 'var(--awd-gold)' : 'rgba(238,234,225,0.55)',
              borderBottom: on ? '1px solid var(--awd-gold)' : '1px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {sort.label}
          </Link>
        )
      })}
    </div>
  )
}

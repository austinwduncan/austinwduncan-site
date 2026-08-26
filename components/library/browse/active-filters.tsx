import Link from 'next/link'

/*
  What the reader has already asked for, said back to them.

  Each chip is a link to this same URL minus its own param, so removing a
  filter is a navigation like everything else on the page. The hrefs are built
  by the page rather than in here, because dropping a scripture chip has to
  take the chapter and verse with it and only the page knows that.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export type ActiveFilter = { key: string; label: string; value: string; href: string }

export default function ActiveFilters({
  filters, clearHref,
}: {
  filters: ActiveFilter[]
  clearHref: string
}) {
  if (!filters.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(filter => (
        <Link
          key={`${filter.key}:${filter.value}`}
          href={filter.href}
          className="group inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 transition-colors"
          style={{
            borderColor: 'color-mix(in srgb, var(--awd-gold) 45%, transparent)',
            background: 'rgba(205,176,121,0.08)',
          }}
        >
          <span
            className="shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.16em]"
            style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
          >
            {filter.label}
          </span>
          <span
            className="min-w-0 truncate text-[0.78rem]"
            style={{ fontFamily: 'var(--font-source-serif)', color: 'var(--awd-gold)' }}
          >
            {filter.value}
          </span>
          <span
            aria-hidden
            className="shrink-0 text-[0.85rem] leading-none transition-colors group-hover:text-[var(--awd-bone)]"
            style={{ color: 'var(--awd-stone)' }}
          >
            &times;
          </span>
          <span className="sr-only">Remove this filter</span>
        </Link>
      ))}

      {filters.length > 1 && (
        <Link
          href={clearHref}
          className="ml-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--awd-gold)]"
          style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
        >
          Clear all
        </Link>
      )}
    </div>
  )
}

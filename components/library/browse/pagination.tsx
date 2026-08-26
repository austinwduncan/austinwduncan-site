import Link from 'next/link'
import { buildHref, withParam, withoutParam, type Params } from '@/components/library/browse/url'

/*
  Paging, in the URL like everything else.

  Two hundred and thirteen results is more than anybody scrolls and far more
  than is worth rendering, so a page is a window and offset says which window.
  Page numbers rather than a load more button, because a load more button
  either loses its accumulated state on a back navigation or needs client
  state to keep it, and neither is worth the trade here.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

function hrefForPage(params: Params, page: number, pageSize: number): string {
  return buildHref(
    page === 0
      ? withoutParam(params, 'offset')
      : withParam(params, 'offset', String(page * pageSize)),
  )
}

/** First, last, and a window of three around the current page. */
function pageList(current: number, pages: number): (number | null)[] {
  const keep = new Set<number>([0, pages - 1, current - 1, current, current + 1])
  const shown = [...keep].filter(p => p >= 0 && p < pages).sort((a, b) => a - b)
  const out: (number | null)[] = []
  let previous = -1
  for (const page of shown) {
    if (previous !== -1 && page > previous + 1) out.push(null)
    out.push(page)
    previous = page
  }
  return out
}

export default function Pagination({
  params, total, offset, pageSize,
}: {
  params: Params
  total: number
  offset: number
  pageSize: number
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null

  const current = Math.min(Math.floor(offset / pageSize), pages - 1)
  const step = (page: number, label: string, enabled: boolean) =>
    enabled ? (
      <Link
        href={hrefForPage(params, page, pageSize)}
        className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--awd-gold)]"
        style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.6)' }}
      >
        {label}
      </Link>
    ) : (
      <span
        className="text-[0.66rem] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.2)' }}
      >
        {label}
      </span>
    )

  return (
    <nav
      aria-label="Result pages"
      className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t pt-6"
      style={{ borderColor: 'rgba(238,234,225,0.1)' }}
    >
      {step(current - 1, 'Previous', current > 0)}

      <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {pageList(current, pages).map((page, i) =>
          page === null ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="px-1 text-[0.7rem]"
              style={{ color: 'var(--awd-stone)' }}
            >
              &hellip;
            </span>
          ) : (
            <Link
              key={page}
              href={hrefForPage(params, page, pageSize)}
              aria-current={page === current ? 'page' : undefined}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-[2px] px-2 text-[0.72rem] tabular-nums transition-colors"
              style={{
                fontFamily: HEADING,
                fontWeight: 600,
                color: page === current ? 'var(--awd-black)' : 'rgba(238,234,225,0.6)',
                background: page === current ? 'var(--awd-gold)' : 'transparent',
              }}
            >
              {page + 1}
            </Link>
          ),
        )}
      </div>

      {step(current + 1, 'Next', current < pages - 1)}
    </nav>
  )
}

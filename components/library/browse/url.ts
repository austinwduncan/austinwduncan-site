/*
  Pure URL helpers for the faceted browse page.

  The page keeps no client state. Every facet is a search param, so a link is
  the only control the page needs and every view is shareable, bookmarkable
  and correct under back and forward. These helpers are the one place that
  knows how a set of params becomes an href.
*/

export const BROWSE_PATH = '/library/browse'

export type Params = Readonly<Record<string, string>>

/*
  Params are written in a fixed order so the same filter set always produces
  the same URL. Two links to the same view then look identical in the address
  bar and share a router cache entry.
*/
const ORDER = [
  'q', 'collection', 'series', 'format', 'level', 'topic', 'doctrine',
  'approach', 'book', 'chapter', 'verse', 'sort', 'expand', 'offset',
]

function rank(key: string): number {
  const i = ORDER.indexOf(key)
  return i === -1 ? ORDER.length : i
}

export function buildHref(params: Params, path: string = BROWSE_PATH): string {
  const search = new URLSearchParams()
  const keys = Object.keys(params).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
  for (const key of keys) {
    const value = params[key]
    if (value !== undefined && value !== '') search.set(key, value)
  }
  const qs = search.toString()
  return qs ? `${path}?${qs}` : path
}

type Options = { resetOffset?: boolean }

/*
  Setting or clearing a facet resets paging. Page four of a six result view is
  nowhere, and landing there is the classic faceted browse bug.
*/
export function withParam(
  params: Params, key: string, value: string, options: Options = {},
): Params {
  const next: Record<string, string> = { ...params, [key]: value }
  // Setting offset is paging, so it never resets itself.
  if (options.resetOffset !== false && key !== 'offset') delete next.offset
  return next
}

export function withoutParam(params: Params, key: string, options: Options = {}): Params {
  const next: Record<string, string> = { ...params }
  delete next[key]
  if (options.resetOffset !== false) delete next.offset
  return next
}

export function toggleParam(params: Params, key: string, value: string): Params {
  return params[key] === value ? withoutParam(params, key) : withParam(params, key, value)
}

/* Disclosure state lives in the URL too, so opening "show all topics" and then
   picking one does not slam the list shut behind you. */
export function expandedSet(params: Params): Set<string> {
  return new Set((params.expand ?? '').split(',').filter(Boolean))
}

export function isExpanded(params: Params, name: string): boolean {
  return expandedSet(params).has(name)
}

export function withExpanded(params: Params, name: string): Params {
  const set = expandedSet(params)
  set.add(name)
  return withParam(params, 'expand', [...set].sort().join(','), { resetOffset: false })
}

export function withoutExpanded(params: Params, name: string): Params {
  const set = expandedSet(params)
  set.delete(name)
  const joined = [...set].sort().join(',')
  return joined
    ? withParam(params, 'expand', joined, { resetOffset: false })
    : withoutParam(params, 'expand', { resetOffset: false })
}

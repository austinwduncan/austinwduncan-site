import type { Metadata } from 'next'
import Link from 'next/link'
import { getPieces, getTaxonomy } from '@/lib/library/queries'
import type { LibraryFilters, Piece } from '@/lib/library/types'
import ActiveFilters, { type ActiveFilter } from '@/components/library/browse/active-filters'
import BrowsePieceCard from '@/components/library/browse/piece-card'
import FacetGroup from '@/components/library/browse/facet-group'
import Pagination from '@/components/library/browse/pagination'
import SearchField from '@/components/library/browse/search-field'
import SortLinks, { SORTS } from '@/components/library/browse/sort-links'
import { getDoctrineLinks } from '@/components/library/browse/doctrine-links'
import {
  countsFor, narrow, narrowestFilter, optionsByCount, optionsInOrder,
  RAIL_DIMENSIONS, type Selection,
} from '@/components/library/browse/facets'
import { buildHref, withoutParam, type Params } from '@/components/library/browse/url'

/*
  Browse everything.

  The whole page is one server component and the URL is the only state it has.
  Every control is a link back to this same route with a param added or taken
  away, so a narrowed view can be pasted to somebody else, bookmarked, and
  walked backwards and forwards through history without a single line of
  client code. Nothing here is 'use client'.

  How the filtering divides. Five dimensions live on a Piece already, so the
  page asks the database once for everything that survives the dimensions it
  cannot express there (series, approach, scripture, free text) and narrows
  collection, format, level, topic and doctrine in memory. That is one query
  instead of six, and it is the only way to get honest facet counts: a count
  has to be computed with its own filter lifted, otherwise every unselected
  option in the active group reads zero and the rail becomes a dead end.

  A facet value that matches no slug is dropped rather than applied, so
  ?collection=nonsense browses the whole Library instead of showing an empty
  page or throwing.
*/

export const metadata: Metadata = {
  title: 'Browse the Library',
  description:
    'Narrow everything Austin W. Duncan has taught by collection, format, depth, topic, doctrine or search.',
}

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

/** Results per page. Two hundred cards at once is waste, not generosity. */
const PAGE_SIZE = 24

/*
  There are 152 topics and 61 doctrines. Neither list goes into a rail flat,
  so the head by count is shown and the tail sits behind a disclosure.
*/
const TOPIC_HEAD = 12
const DOCTRINE_HEAD = 10

type RawParams = { [key: string]: string | string[] | undefined }

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

/** Keeps a value only if it names something real. Anything else is ignored. */
const knownSlug = (
  list: readonly { slug: string }[], value: string | undefined,
): string | undefined => (value && list.some(x => x.slug === value) ? value : undefined)

const positiveInt = (value: string | undefined): number | undefined => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : undefined
}

export default async function LibraryBrowsePage({
  searchParams,
}: {
  searchParams: Promise<RawParams>
}) {
  const [raw, tax, doctrineLinks] = await Promise.all([
    searchParams,
    getTaxonomy(),
    getDoctrineLinks(),
  ])

  // ── Read the URL ──────────────────────────────────────────────────────────
  const collection = knownSlug(tax.collections, first(raw.collection))
  const series = knownSlug(tax.series, first(raw.series))
  const format = knownSlug(tax.formats, first(raw.format))
  const level = knownSlug(tax.levels, first(raw.level))
  const topic = knownSlug(tax.topics, first(raw.topic))
  const doctrine = knownSlug(tax.doctrines, first(raw.doctrine))
  const approach = knownSlug(tax.approaches, first(raw.approach))
  const book = knownSlug(tax.books, first(raw.book))
  const chapter = book ? positiveInt(first(raw.chapter)) : undefined
  const verse = chapter ? positiveInt(first(raw.verse)) : undefined

  const q = (first(raw.q) ?? '').trim().slice(0, 120)
  const sortParam = first(raw.sort)
  const sort = (SORTS.some(s => s.slug === sortParam) ? sortParam : 'newest') as
    NonNullable<LibraryFilters['sort']>

  const expand = (first(raw.expand) ?? '')
    .split(',')
    .filter(name => (RAIL_DIMENSIONS as readonly string[]).includes(name))
    .sort()
    .join(',')

  const offset = Math.max(0, Number(first(raw.offset)) || 0)

  /*
    The canonical param set. Every link on the page is built from this rather
    than from the raw query string, so a value that named nothing disappears
    from the URL the moment the reader clicks anything.
  */
  const params: Params = {
    ...(q ? { q } : {}),
    ...(collection ? { collection } : {}),
    ...(series ? { series } : {}),
    ...(format ? { format } : {}),
    ...(level ? { level } : {}),
    ...(topic ? { topic } : {}),
    ...(doctrine ? { doctrine } : {}),
    ...(approach ? { approach } : {}),
    ...(book ? { book } : {}),
    ...(chapter ? { chapter: String(chapter) } : {}),
    ...(verse ? { verse: String(verse) } : {}),
    ...(sort !== 'newest' ? { sort } : {}),
    ...(expand ? { expand } : {}),
    ...(offset > 0 ? { offset: String(offset) } : {}),
  }

  // ── One read ──────────────────────────────────────────────────────────────
  const serverFilters: LibraryFilters = {
    series, approach, book, chapter, verse, sort,
    ...(q ? { q } : {}),
    // Doctrine is normally narrowed in memory so its own counts stay honest.
    // If the join table could not be read, the database does it instead.
    ...(!doctrineLinks.ok && doctrine ? { doctrine } : {}),
  }
  const base = await getPieces(serverFilters)

  const doctrineSlugById = new Map(tax.doctrines.map(d => [d.id, d.slug]))
  const doctrineCache = new Map<string, string[]>()
  const doctrinesOf = (piece: Piece): string[] => {
    const hit = doctrineCache.get(piece.id)
    if (hit) return hit
    const slugs = (doctrineLinks.byContent.get(piece.id) ?? [])
      .map(id => doctrineSlugById.get(id))
      .filter((s): s is string => Boolean(s))
    doctrineCache.set(piece.id, slugs)
    return slugs
  }

  const selection: Selection = {
    collection, format, level, topic,
    ...(doctrineLinks.ok ? { doctrine } : {}),
  }

  const results = narrow(base, selection, doctrinesOf)
  const total = results.length
  const lastPageStart = total ? Math.floor((total - 1) / PAGE_SIZE) * PAGE_SIZE : 0
  const safeOffset = Math.min(offset, lastPageStart)
  const page = results.slice(safeOffset, safeOffset + PAGE_SIZE)

  // ── Facet options ─────────────────────────────────────────────────────────
  const counts = (dim: (typeof RAIL_DIMENSIONS)[number]) =>
    countsFor(base, dim, selection, doctrinesOf)

  const collectionOptions = optionsInOrder(tax.collections, counts('collection'))
  const formatOptions = optionsInOrder(tax.formats, counts('format'))
  const levelOptions = optionsInOrder(tax.levels, counts('level'))
  const topicOptions = optionsByCount(tax.topics, counts('topic'))
  const doctrineOptions = optionsByCount(tax.doctrines, counts('doctrine'))

  // ── Chips ─────────────────────────────────────────────────────────────────
  const nameOf = (list: readonly { slug: string; name: string }[], slug: string) =>
    list.find(x => x.slug === slug)?.name ?? slug

  const chips: ActiveFilter[] = []
  const chip = (key: string, label: string, value: string, href?: string) =>
    chips.push({ key, label, value, href: href ?? buildHref(withoutParam(params, key)) })

  if (q) chip('q', 'Search', q)
  if (collection) chip('collection', 'Collection', nameOf(tax.collections, collection))
  if (series) chip('series', 'Series', nameOf(tax.series, series))
  if (format) chip('format', 'Format', nameOf(tax.formats, format))
  if (level) chip('level', 'Depth', nameOf(tax.levels, level))
  if (topic) chip('topic', 'Topic', nameOf(tax.topics, topic))
  if (doctrine) chip('doctrine', 'Doctrine', nameOf(tax.doctrines, doctrine))
  if (approach) chip('approach', 'Approach', nameOf(tax.approaches, approach))
  if (book) {
    // Chapter and verse only mean anything under a book, so they leave with it.
    const label = [nameOf(tax.books, book), chapter, verse]
      .filter(v => v != null)
      .join(' ')
      .replace(/(\S+) (\d+) (\d+)$/, '$1 $2:$3')
    const href = buildHref(
      withoutParam(withoutParam(withoutParam(params, 'verse'), 'chapter'), 'book'),
    )
    chip('book', 'Scripture', label, href)
  }

  // ── The empty case ────────────────────────────────────────────────────────
  const narrowest = total === 0 ? narrowestFilter(base, selection, doctrinesOf) : null
  const narrowestLabel = narrowest
    ? {
        collection: 'Collection',
        format: 'Format',
        level: 'Depth',
        topic: 'Topic',
        doctrine: 'Doctrine',
      }[narrowest.dim]
    : null
  const narrowestName = narrowest
    ? nameOf(
        {
          collection: tax.collections,
          format: tax.formats,
          level: tax.levels,
          topic: tax.topics,
          doctrine: tax.doctrines,
        }[narrowest.dim],
        narrowest.slug,
      )
    : null

  const showingFrom = total ? safeOffset + 1 : 0
  const showingTo = safeOffset + page.length

  return (
    <div style={{ background: 'var(--awd-black)', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-[1500px] px-6 lg:px-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="pt-14 lg:pt-16">
          <div
            className="mb-4 flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
          >
            <Link
              href="/library"
              className="transition-colors hover:text-[var(--awd-bone)]"
              style={{ color: 'rgba(238,234,225,0.45)' }}
            >
              Library
            </Link>
            <span aria-hidden style={{ color: 'rgba(238,234,225,0.25)' }}>/</span>
            <span aria-hidden className="inline-block h-px w-[18px]" style={{ background: 'var(--awd-gold)' }} />
            Browse
          </div>

          <div className="flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
            style={{ borderColor: 'rgba(238,234,225,0.1)' }}
          >
            <div className="min-w-0">
              <h1
                style={{
                  fontFamily: HEADING,
                  fontSize: 'clamp(2.2rem, 3.6vw, 3.1rem)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: 'var(--awd-bone)',
                }}
              >
                Browse everything
              </h1>
              <p
                className="mt-3 max-w-[46ch] text-[0.9rem] italic leading-relaxed"
                style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(238,234,225,0.42)' }}
              >
                One collection, entered any way you like. Narrow by collection, format,
                depth, topic, doctrine or a word in the title.
              </p>
            </div>

            <div className="w-full min-w-0 lg:max-w-[380px]">
              <SearchField params={params} />
            </div>
          </div>
        </header>

        {/*
          Flex rather than grid for the shell. A grid column of 1fr means
          minmax(auto, 1fr), which refuses to shrink below its content and
          pushes a sticky rail layout sideways off the page. flex-1 plus
          min-w-0 cannot do that, and neither can the auto fill grid below,
          whose track minimum is capped at 100% of its own container.
        */}
        <div className="flex flex-col gap-10 pb-28 pt-10 lg:flex-row lg:gap-14 lg:pb-36">

          {/* ── Facet rail ─────────────────────────────────────────────────── */}
          <aside className="w-full min-w-0 lg:w-[240px] lg:shrink-0">
            <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh_-_8rem)] lg:overflow-y-auto lg:pb-10">
              <FacetGroup
                label="Collection" name="collection"
                options={collectionOptions} params={params} active={collection}
              />
              <FacetGroup
                label="Format" name="format"
                options={formatOptions} params={params} active={format}
              />
              <FacetGroup
                label="Depth" name="level"
                options={levelOptions} params={params} active={level}
              />
              <FacetGroup
                label="Topic" name="topic"
                options={topicOptions} params={params} active={topic}
                head={TOPIC_HEAD} expandable
              />
              <FacetGroup
                label="Doctrine" name="doctrine"
                options={doctrineOptions} params={params} active={doctrine}
                head={DOCTRINE_HEAD} expandable
              />
            </div>
          </aside>

          {/* ── Results ────────────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-5">
              {chips.length > 0 && (
                <ActiveFilters filters={chips} clearHref={buildHref({})} />
              )}

              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
                <p
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
                >
                  {total === 0
                    ? 'No results'
                    : `Showing ${showingFrom} to ${showingTo} of ${total} ${total === 1 ? 'piece' : 'pieces'}`}
                </p>
                <SortLinks params={params} active={sort} />
              </div>
            </div>

            {total === 0 ? (
              <div
                className="mt-8 border px-6 py-14 text-center"
                style={{ borderColor: 'rgba(238,234,225,0.12)', background: 'rgba(44,48,47,0.35)' }}
              >
                <p
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
                >
                  Nothing matches
                </p>
                <p
                  className="mx-auto mt-4 max-w-[52ch] text-[1rem] leading-relaxed"
                  style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(238,234,225,0.72)' }}
                >
                  {chips.length
                    ? `Nothing in the Library matches ${chips.map(c => `${c.label} ${c.value}`).join(' and ')}.`
                    : 'The Library returned nothing at all.'}
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                  {narrowest && narrowestLabel && narrowestName && (
                    <Link
                      href={buildHref(withoutParam(params, narrowest.dim))}
                      className="inline-flex items-center rounded-[2px] px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-85"
                      style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: 'var(--awd-black)' }}
                    >
                      {`Drop ${narrowestLabel.toLowerCase()} ${narrowestName} for ${narrowest.wouldReturn} results`}
                    </Link>
                  )}
                  <Link
                    href={buildHref({})}
                    className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--awd-gold)]"
                    style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.55)' }}
                  >
                    Clear every filter
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="mt-8 min-w-0"
                  style={{
                    display: 'grid',
                    // min() caps the track floor at the container width, so a
                    // narrow viewport shrinks the card instead of overflowing.
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 232px), 1fr))',
                    gap: '2.2rem 1.4rem',
                  }}
                >
                  {page.map(piece => (
                    <BrowsePieceCard key={piece.id} piece={piece} />
                  ))}
                </div>

                <Pagination
                  params={params} total={total} offset={safeOffset} pageSize={PAGE_SIZE}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

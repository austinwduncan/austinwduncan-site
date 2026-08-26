'use client'

import { useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { type CardItem } from '@/components/browse/channel-card'
import Shelf from '@/components/browse/shelf'

/*
  Apple TV style browse.

  Three things make it read as a streaming app rather than an index:

  1. The billboard changes with the channel. Selecting In the Text swaps the
     whole backdrop, title and CTA, the way picking a channel on Apple TV
     re-skins the top of the screen.
  2. Read state is real. ReadMarker already writes every article slug to
     localStorage on view, so this reads the same key: cards you have read get
     a tick, and the billboard offers the newest thing you have NOT read.
  3. One channel at a time. Six shelves stacked was the thing that read as
     chaos.

  Channel lives in the URL hash so it is linkable and survives reload, without
  the Suspense boundary useSearchParams would force.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'
const BONE = '#EEEAE1'
const GOLD = '#CDB079'
const READ_KEY = 'read_articles'


/*
  localStorage as an external store. getSnapshot must return a stable value or
  React re-renders forever, so the raw string is cached and only replaced when
  it actually changes.
*/
let cachedRead = '[]'

function getReadSnapshot(): string {
  try {
    const raw = localStorage.getItem(READ_KEY) ?? '[]'
    if (raw !== cachedRead) cachedRead = raw
  } catch {
    // Private windows and blocked site data throw; the cached value stands.
  }
  return cachedRead
}

function subscribeToRead(onChange: () => void): () => void {
  // 'storage' fires for other tabs; same-tab writes happen on article pages,
  // so a fresh navigation here picks them up anyway.
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

/*
  The URL hash is external state too, so it goes through the same mechanism.
  replaceState does not fire hashchange, so selecting a channel notifies the
  subscribers directly.
*/
const hashListeners = new Set<() => void>()

function getHashSnapshot(): string {
  return window.location.hash.replace('#', '') || 'all'
}

function subscribeToHash(onChange: () => void): () => void {
  hashListeners.add(onChange)
  window.addEventListener('hashchange', onChange)
  return () => {
    hashListeners.delete(onChange)
    window.removeEventListener('hashchange', onChange)
  }
}

function setChannelHash(id: string) {
  window.history.replaceState(null, '', id === 'all' ? window.location.pathname : `#${id}`)
  hashListeners.forEach(fn => fn())
}

export type Channel = {
  id: string
  label: string
  blurb: string
  href: string
  seeAll: string
  items: CardItem[]
}

export default function BrowseShell({
  channels,
  highlights,
}: {
  channels: Channel[]
  highlights: CardItem[]
}) {
  /*
    Both the read list and the selected channel are external state that differs
    between server and client, so both go through useSyncExternalStore. It
    hands the server a stable empty snapshot (so hydration matches) and swaps
    in the real value after mount, without setting state from an effect.
  */
  const rawRead = useSyncExternalStore(subscribeToRead, getReadSnapshot, () => '[]')
  const readSlugs = useMemo<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(rawRead))
    } catch {
      return new Set<string>()
    }
  }, [rawRead])

  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot, () => 'all')
  const active = hash === 'all' || channels.some(c => c.id === hash) ? hash : 'all'

  const current = channels.find(c => c.id === active)
  const items = useMemo(
    () => (active === 'all' ? highlights : (current?.items ?? [])),
    [active, highlights, current],
  )

  // The billboard prefers the newest unread item, which is what a streaming
  // app would surface. Falls back to the newest overall.
  const billboard = useMemo(() => {
    if (!items.length) return null
    return items.find(i => !readSlugs.has(i.slug)) ?? items[0]
  }, [items, readSlugs])

  const unread = items.filter(i => !readSlugs.has(i.slug)).length
  const newToYou = useMemo(
    () => items.filter(i => !readSlugs.has(i.slug)).slice(0, 12),
    [items, readSlugs],
  )
  // The series channel groups by teaching lane, which is the closest thing
  // this content has to genre rows.
  const lanes = useMemo(() => {
    const byLane = new Map<string, CardItem[]>()
    for (const item of items) {
      const key = item.kicker ?? 'Series'
      byLane.set(key, [...(byLane.get(key) ?? []), item])
    }
    return [...byLane.entries()].map(([name, list]) => ({ name, items: list }))
  }, [items])
  const rail = [{ id: 'all', label: 'All' }, ...channels.map(c => ({ id: c.id, label: c.label }))]

  return (
    <>
      {/* ── Billboard ──────────────────────────────────────────────────────── */}
      {billboard && (
        <section
          key={billboard.href}
          className="relative -mt-[60px] overflow-hidden"
          style={{ background: '#171918' }}
        >
          <div className="relative flex min-h-[58svh] items-end pt-32 lg:min-h-[66svh] lg:pt-36">
            {billboard.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={billboard.image}
                alt=""
                className="absolute inset-0 h-full w-full animate-[bb_900ms_ease-out] object-cover lg:left-[18%] lg:w-auto lg:min-w-[82%]"
                style={{ objectPosition: '50% 42%' }}
              />
            )}
            <span aria-hidden className="absolute inset-0 hidden lg:block"
              style={{ background: 'linear-gradient(90deg,#171918 0%,#171918 26%,rgba(23,25,24,.88) 46%,rgba(23,25,24,.3) 70%,transparent 92%)' }} />
            <span aria-hidden className="absolute inset-0 hidden lg:block"
              style={{ background: 'linear-gradient(0deg,#171918 0%,transparent 44%)' }} />
            <span aria-hidden className="absolute inset-0 lg:hidden"
              style={{ background: 'linear-gradient(0deg,#171918 0%,#171918 20%,rgba(23,25,24,.78) 52%,rgba(23,25,24,.2) 84%,transparent 100%)' }} />

            <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-14 lg:px-10 lg:pb-20">
              <div className="max-w-xl">
                <p
                  className="flex items-center gap-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.2em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
                >
                  <span className="inline-block h-px w-6" style={{ background: 'var(--awd-accent-2)' }} />
                  {active === 'all' ? (billboard.kicker ?? 'Featured') : current?.label}
                </p>
                <h1
                  className="mt-4 uppercase"
                  style={{
                    fontFamily: HEADING, fontSize: 'clamp(1.8rem, 3.6vw, 3.2rem)',
                    fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.02em', color: BONE,
                  }}
                >
                  {billboard.title}
                </h1>
                {billboard.blurb && (
                  <p className="mt-4 line-clamp-2 text-[1rem] leading-relaxed"
                    style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.76)' }}>
                    {billboard.blurb}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href={billboard.href}
                    className="group/cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-transform duration-200 hover:scale-[1.03]"
                    style={{ fontFamily: HEADING, background: GOLD, color: '#171918' }}
                  >
                    Read now
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                  </Link>
                  {billboard.meta && (
                    <span
                      className="rounded-full border px-3.5 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] backdrop-blur"
                      style={{
                        fontFamily: HEADING,
                        borderColor: 'rgba(238,234,225,0.2)',
                        background: 'rgba(23,25,24,0.4)',
                        color: 'rgba(238,234,225,0.8)',
                      }}
                    >
                      {billboard.meta}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <style>{`@keyframes bb{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}`}</style>
        </section>
      )}

      {/* ── Rail + grid ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1500px] px-6 pb-28 pt-12 lg:px-10 lg:pb-36">
        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Channels" className="lg:sticky lg:top-24 lg:self-start">
            <p
              className="mb-4 text-[0.62rem] font-semibold uppercase tracking-[0.22em]"
              style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.35)' }}
            >
              Channels
            </p>
            <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {rail.map(c => {
                const on = c.id === active
                return (
                  <li key={c.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setChannelHash(c.id)}
                      aria-current={on ? 'true' : undefined}
                      className="w-full whitespace-nowrap rounded-full border px-4 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4"
                      style={{
                        fontFamily: HEADING,
                        borderColor: on ? GOLD : 'rgba(238,234,225,0.14)',
                        background: on ? 'rgba(205,176,121,0.1)' : 'transparent',
                        color: on ? GOLD : 'rgba(238,234,225,0.6)',
                      }}
                    >
                      {c.label}
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-8 hidden border-t pt-6 lg:block" style={{ borderColor: 'rgba(238,234,225,0.1)' }}>
              <Link
                href="/library"
                className="group inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
                style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.55)' }}
              >
                The Library
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-2 text-[0.78rem] leading-relaxed"
                style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.35)' }}>
                793 books. Not my work, but the books behind it.
              </p>
            </div>
          </nav>

          <div className="mt-10 lg:mt-0">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  className="uppercase"
                  style={{
                    fontFamily: HEADING, fontSize: 'clamp(1.4rem, 2.4vw, 2rem)',
                    fontWeight: 700, letterSpacing: '-0.02em', color: BONE,
                  }}
                >
                  {active === 'all' ? 'Latest across everything' : current?.label}
                  <span className="ml-3 text-[0.62em]" style={{ color: 'var(--awd-accent-2)' }}>
                    {items.length}
                  </span>
                </h2>
                <p className="mt-2.5 max-w-xl text-[0.95rem] leading-relaxed"
                  style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.6)' }}>
                  {active === 'all'
                    ? 'The newest thing from every channel, most recent first.'
                    : current?.blurb}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                {unread < items.length && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em]"
                    style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.5)' }}
                  >
                    <Check size={12} style={{ color: GOLD }} />
                    {items.length - unread} read
                  </span>
                )}
                {current && (
                  <Link
                    href={current.href}
                    className="group inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                    style={{ fontFamily: HEADING, color: GOLD }}
                  >
                    {current.seeAll}
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>

            {/*
              Shelves inside the channel rather than one flat grid. Rows across
              channels was the thing that read as chaos; rows within a single
              channel is just how Netflix is built, and stays calm because only
              one channel is on screen.
            */}
            {newToYou.length > 0 && newToYou.length < items.length && (
              <Shelf title="New to you" items={newToYou} readSlugs={readSlugs} accentTitle />
            )}
            {active === 'in-the-text' ? (
              lanes.map(lane => (
                <Shelf
                  key={lane.name}
                  title={lane.name}
                  items={lane.items}
                  readSlugs={readSlugs}
                  numbered={lane.name === 'Bible Book Studies'}
                />
              ))
            ) : (
              <>
                <Shelf title="Most recent" items={items.slice(0, 12)} readSlugs={readSlugs} />
                {items.length > 12 && (
                  <Shelf title="Further back" items={items.slice(12)} readSlugs={readSlugs} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

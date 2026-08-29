'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Piece, Season } from '@/lib/library/types'
import Artwork from '@/components/library/artwork'

/*
  Word for Word, organised the way the show is actually organised.

  This is not a list of episodes. It is eight subjects, each a run of questions,
  and the page is built as eight sections so a reader lands on the subject their
  question belongs to rather than scrolling 71 rows looking for it.

  Within a subject the newest question takes a wide panel and the rest run as a
  grid beneath it, which gives every section a lead and a shape instead of a
  uniform column. A subject of three reads as deliberately small rather than as
  a stub.

  The cover carries each question, because Austin typesets the question into the
  artwork. The text beneath repeats it for anyone who cannot see the image, and
  nothing is laid over the art.

  Episode numbers are printed as given. They run 1 to 71 across the whole show,
  so a subject's numbers are non contiguous by design.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

const newestFirst = (a: Piece, b: Piece) => (b.episode ?? 0) - (a.episode ?? 0)

function EpisodeNumber({ n }: { n: number | null }) {
  if (n == null) return null
  return (
    <span
      className="tabular-nums"
      style={{
        fontFamily: HEADING,
        fontWeight: 700,
        fontSize: '0.74rem',
        letterSpacing: '0.08em',
        color: 'var(--awd-gold)',
      }}
    >
      {String(n).padStart(2, '0')}
    </span>
  )
}

/** The lead of a subject: cover beside the question, given room. */
function LeadQuestion({ piece }: { piece: Piece }) {
  return (
    <Link
      href={piece.href}
      className="group grid gap-x-9 gap-y-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]"
    >
      <Artwork
        src={piece.artwork}
        title={piece.title}
        className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
      />
      <div className="min-w-0 self-center">
        <EpisodeNumber n={piece.episode} />
        <h3
          className="mt-3 transition-colors group-hover:text-[var(--awd-gold)]"
          style={{
            fontFamily: HEADING,
            fontWeight: 600,
            fontSize: 'clamp(1.35rem, 2.4vw, 1.95rem)',
            letterSpacing: '-0.018em',
            lineHeight: 1.16,
            color: 'var(--awd-bone)',
          }}
        >
          {piece.title}
        </h3>
        {(piece.subtitle || piece.summary) && (
          <p
            className="mt-4 max-w-[38rem] text-[0.95rem] leading-relaxed"
            style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.68)' }}
          >
            {piece.subtitle ?? piece.summary}
          </p>
        )}
      </div>
    </Link>
  )
}

/** The rest of a subject: cover, number, question. */
function QuestionCard({ piece }: { piece: Piece }) {
  return (
    <Link href={piece.href} className="group block min-w-0">
      <Artwork
        src={piece.artwork}
        title={piece.title}
        className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
      />
      <div className="mt-3.5 flex items-baseline gap-3">
        <EpisodeNumber n={piece.episode} />
        <h3
          className="min-w-0 text-[0.94rem] transition-colors group-hover:text-[var(--awd-gold)]"
          style={{
            fontFamily: HEADING,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.28,
            color: 'var(--awd-bone)',
          }}
        >
          {piece.title}
        </h3>
      </div>
    </Link>
  )
}

export default function WordForWordChannel({
  seasons,
  loose,
}: {
  seasons: Season[]
  loose: Piece[]
}) {
  const [only, setOnly] = useState<string | null>(null)

  const subjects = seasons
    .map(s => ({ ...s, episodes: [...s.episodes].sort(newestFirst) }))
    .filter(s => s.episodes.length)

  const shown = only ? subjects.filter(s => s.slug === only) : subjects
  const total = subjects.reduce((n, s) => n + s.episodes.length, 0) + loose.length

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-14 lg:px-8 lg:py-16">
      {/* Jump to a subject. The page still holds all of them; this narrows it. */}
      <nav className="flex flex-wrap gap-2">
        {[{ slug: null as string | null, name: 'Every subject', n: total }, ...subjects.map(s => ({
          slug: s.slug as string | null,
          name: s.name,
          n: s.episodes.length,
        }))].map(item => {
          const on = only === item.slug
          return (
            <button
              key={item.slug ?? 'all'}
              type="button"
              onClick={() => setOnly(item.slug)}
              className="rounded-full border px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] transition-colors"
              style={{
                fontFamily: HEADING,
                borderColor: on ? 'var(--awd-gold)' : 'rgba(238,234,225,0.16)',
                color: on ? 'var(--awd-gold)' : 'rgba(238,234,225,0.7)',
                background: on ? 'rgba(205,176,121,0.1)' : 'transparent',
              }}
            >
              {item.name}
              <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>{item.n}</span>
            </button>
          )
        })}
      </nav>

      {shown.map(subject => {
        const [lead, ...rest] = subject.episodes
        return (
          <section key={subject.id} className="mt-16 lg:mt-20">
            <div className="mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h2
                className="uppercase"
                style={{
                  fontFamily: HEADING,
                  fontWeight: 700,
                  fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: 'var(--awd-bone)',
                }}
              >
                {subject.name}
              </h2>
              <span
                className="text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
                style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
              >
                {subject.episodes.length} {subject.episodes.length === 1 ? 'question' : 'questions'}
              </span>
              <span aria-hidden className="h-px flex-1" style={{ background: 'rgba(238,234,225,0.12)' }} />
            </div>

            <LeadQuestion piece={lead} />

            {rest.length > 0 && (
              <div
                className="mt-10 grid gap-x-6 gap-y-9"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 15rem), 1fr))' }}
              >
                {rest.map(piece => (
                  <QuestionCard key={piece.id} piece={piece} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {only && (
        <button
          type="button"
          onClick={() => setOnly(null)}
          className="group/all mt-14 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: '#171918' }}
        >
          Show every subject
          <ArrowRight size={13} className="transition-transform duration-200 group-hover/all:translate-x-0.5" />
        </button>
      )}
    </div>
  )
}

import Link from 'next/link'
import type { Piece } from '@/lib/library/types'
import Artwork from '@/components/library/artwork'

/*
  Forum and Pulpit, laid out as a dated column.

  These are written in the week something happened, which is the fact that
  gives them their weight and also the fact that dates them. So the date is the
  loudest thing on every entry, set as a dateline rather than tucked under a
  title, and the year is stated in full because a piece from 2022 should
  announce that it is from 2022.

  Every one of these carries a subtitle and a passage, so both are shown. This
  is the smallest channel at eight pieces, which means it can afford the space
  a longer list could not.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

const dateline = (iso: string | null) =>
  iso
    ? new Date(iso)
        .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        .toUpperCase()
    : ''

export default function ForumAndPulpitChannel({ pieces }: { pieces: Piece[] }) {
  const essays = [...pieces].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-16 lg:px-8 lg:py-20">
      <ul>
        {essays.map(essay => (
          <li key={essay.id}>
            <Link
              href={essay.href}
              className="group grid gap-x-10 gap-y-6 border-b py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]"
              style={{ borderColor: 'rgba(238,234,225,0.1)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-7" style={{ background: 'var(--awd-gold)' }} />
                  <span
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]"
                    style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
                  >
                    {dateline(essay.publishedAt)}
                  </span>
                </div>

                <h2
                  className="mt-5 transition-colors group-hover:text-[var(--awd-gold)]"
                  style={{
                    fontFamily: HEADING,
                    fontWeight: 600,
                    fontSize: 'clamp(1.35rem, 2.6vw, 2rem)',
                    letterSpacing: '-0.018em',
                    lineHeight: 1.18,
                    color: 'var(--awd-bone)',
                  }}
                >
                  {essay.title}
                </h2>

                {essay.subtitle && (
                  <p
                    className="mt-5 max-w-[44rem] text-[0.97rem] leading-relaxed"
                    style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.68)' }}
                  >
                    {essay.subtitle}
                  </p>
                )}

                <p
                  className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
                >
                  {[
                    essay.scripture[0]?.label,
                    essay.readingMinutes ? `${essay.readingMinutes} min read` : null,
                  ]
                    .filter(Boolean)
                    .join('  ·  ')}
                </p>
              </div>

              <Artwork
                src={essay.artwork}
                title={essay.title}
                className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

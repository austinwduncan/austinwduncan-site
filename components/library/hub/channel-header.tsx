import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Show } from '@/lib/library/types'

/*
  A channel announces itself, and it is the focal point of its section.

  These properties are the thing a visitor has to understand. Word for Word,
  Exegetica, Forum & Pulpit and In the Text each have a real wordmark, and the
  first version of this header set them at about three rem beside a paragraph,
  which made them look like decoration on a row of cards.

  So the mark leads at display scale, on its own line, with a hairline above and
  real air around it. Then one plain sentence saying what the channel is,
  because a name is an identifier and the sentence is what actually tells a
  reader whether this is for them. Then the count and the way in.

  The marks are trimmed to their ink, so any space around them comes from this
  layout rather than from the file. That is what lets the mark set the rhythm
  instead of an arbitrary margin baked into a PNG.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function ChannelHeader({
  show,
  href,
  action = 'Browse',
  meta,
}: {
  show: Show
  href: string
  action?: string
  /** For example "6 studies · 72 pieces". */
  meta?: string
}) {
  return (
    <header>
      <div className="h-px w-full" style={{ background: 'rgba(238,234,225,0.12)' }} />

      <div className="pt-12 lg:pt-16">
        {show.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={show.logo}
            alt={show.name}
            className="h-auto w-auto object-contain"
            /*
              Width is the primary constraint and height is the ceiling, so the
              marks look the same size rather than measure the same size.
              Constraining height alone made Forum & Pulpit, a stacked lockup at
              roughly 3:1, render half the width of Exegetica at 7:1 and read as
              a smaller brand. Wide marks now hit the width cap and the stacked
              one hits the height cap, which is what optical balance means here.
            */
            style={{ maxWidth: 'min(100%, 30rem)', maxHeight: 'clamp(3.2rem, 6.4vw, 6.2rem)' }}
          />
        ) : (
          <h2
            className="uppercase"
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.6vw, 3.6rem)',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              color: 'var(--awd-bone)',
            }}
          >
            {show.name}
          </h2>
        )}

        {show.blurb && (
          <p
            className="mt-7 max-w-[44rem] text-[1.05rem] leading-relaxed lg:text-[1.12rem]"
            style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.76)' }}
          >
            {show.blurb}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href={href}
            className="group/act inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors"
            style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: '#171918' }}
          >
            {action}
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover/act:translate-x-0.5"
            />
          </Link>

          {meta && (
            <span
              className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {meta}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

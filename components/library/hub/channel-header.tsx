import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Show } from '@/lib/library/types'

/*
  A channel announces itself.

  The Library used to head each row with a plain text name, which assumed a
  visitor already knew what "In the Text" or "Exegetica" meant. They do not.
  Austin made real wordmarks for these properties and nothing referenced them.

  So a channel now leads with its own mark and one plain sentence saying what it
  is. A name is an identifier; the blurb is the thing that actually tells a
  reader whether this is for them.

  The mark is white on transparent and sits on the dark ground at its natural
  proportions. Where no mark exists, the name is set in CMG Sans at the same
  weight, so a channel without artwork still reads as a channel.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function ChannelHeader({
  show,
  href,
  action = 'Browse',
}: {
  show: Show
  href: string
  action?: string
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <div className="max-w-[46rem]">
        {show.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={show.logo}
            alt={show.name}
            className="h-auto w-auto max-w-[19rem] object-contain lg:max-w-[23rem]"
            style={{ maxHeight: '3.1rem' }}
          />
        ) : (
          <h2
            className="uppercase"
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 'clamp(1.7rem, 3vw, 2.5rem)',
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
            className="mt-4 max-w-[42rem] text-[0.98rem] leading-relaxed"
            style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.72)' }}
          >
            {show.blurb}
          </p>
        )}
      </div>

      <Link
        href={href}
        className="group/act inline-flex shrink-0 items-center gap-2 border-b pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-[var(--awd-gold)]"
        style={{ fontFamily: HEADING, color: 'var(--awd-bone)', borderColor: 'rgba(238,234,225,0.22)' }}
      >
        {action}
        <ArrowRight size={13} className="transition-transform duration-200 group-hover/act:translate-x-0.5" />
      </Link>
    </div>
  )
}

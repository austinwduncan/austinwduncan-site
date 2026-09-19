import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { AmbigramPreview } from '@/components/ambigram-preview'

export const metadata: Metadata = {
  title: 'Ambigram study',
  description: 'A rotational ambigram wordmark for Austin W. Duncan.',
  robots: { index: false, follow: false },
}

const MARK = fs.readFileSync(
  path.join(process.cwd(), 'public/brand/ambigram-austin-duncan.svg'),
  'utf8',
)

/* Where each letter pair stands. Rotation preserves the angle of a stroke and
   swaps left for right, and those two facts decide every row here. */
const PAIRS = [
  {
    pair: 'A / N',
    verdict: 'Works',
    note: 'The legs converge just enough to read A, and the crossbar falls to the right at the angle an N diagonal wants.',
  },
  {
    pair: 'U / A',
    verdict: 'Works',
    note: 'The strongest joint in the mark. The bar sits low inside the U, and turning it puts the bar exactly where an A crossbar belongs.',
  },
  {
    pair: 'I / U',
    verdict: 'Passable',
    note: 'The stub reads as a flag on the I upright and as the short arm of a U turned. Neither reading is clean, but AUST_N and D_NCAN both leave only one candidate.',
  },
  {
    pair: 'N / D',
    verdict: 'Passable',
    note: 'A D needs a closed bowl and an N needs an open one, so this is tuned to sit between the two and let the surrounding letters decide.',
  },
  {
    pair: 'S / C',
    verdict: 'Fails',
    note: 'A chirality problem, not a drawing problem. An S has an opening on each flank, a C has one, and turning the mark swaps left for right. Every C biased attempt produced a backwards C. This glyph is an S in both directions, so DUNCAN reads DUNSAN.',
  },
  {
    pair: 'T / N',
    verdict: 'Fails',
    note: 'An angle problem. A T is a horizontal over a vertical, an N has no horizontal at all, and rotation cannot turn one into the other. Give the N a real diagonal and the T stops being a T. This is drawn as a clean T, which means it turns into an upside down T.',
  },
]

const VERDICT_TONE: Record<string, string> = {
  Works: 'text-gold',
  Passable: 'text-stone',
  Fails: 'text-[var(--awd-accent-2)]',
}

export default function AmbigramPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-28 lg:py-36">
      <p className="mb-5 flex items-center gap-4 text-[0.7rem] font-bold tracking-[0.22em] text-stone uppercase">
        <span className="h-px w-10 bg-gold" aria-hidden />
        Wordmark study
      </p>

      <h1 className="mb-6 text-4xl leading-[0.95] font-bold tracking-[-0.02em] text-bone uppercase sm:text-6xl">
        Austin Duncan, <span className="text-gold">turned</span>
      </h1>

      <p className="mb-16 max-w-2xl text-base leading-[1.72] text-stone">
        One drawing that is meant to read the same upside down. Only the left
        half is drawn. The right half is that same group reused through a
        single rotation, so the symmetry is exact and cannot drift when a letter
        is edited. What the symmetry cannot guarantee is that each shape still
        reads as a letter, and that is where this mark is honest about its
        limits.
      </p>

      <AmbigramPreview svg={MARK} />

      <section className="mt-24">
        <h2 className="mb-3 text-2xl font-bold tracking-[-0.02em] text-bone uppercase">
          Where it holds and where it breaks
        </h2>
        <p className="mb-10 max-w-2xl text-base leading-[1.72] text-stone">
          Upright the mark reads close to AUSTIN. Turned it does not yet read
          DUNCAN, and two of the six letter pairs are the reason. Both are
          structural rather than a matter of more careful drawing.
        </p>

        <ul className="divide-y divide-[var(--awd-graphite)] border-y border-[var(--awd-graphite)]">
          {PAIRS.map((p) => (
            <li key={p.pair} className="grid gap-2 py-6 sm:grid-cols-[7rem_7rem_1fr] sm:gap-6">
              <span className="text-sm font-bold tracking-[0.12em] text-bone uppercase">
                {p.pair}
              </span>
              <span
                className={`text-[0.7rem] font-bold tracking-[0.18em] uppercase ${VERDICT_TONE[p.verdict]}`}
              >
                {p.verdict}
              </span>
              <span className="text-base leading-[1.72] text-stone">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

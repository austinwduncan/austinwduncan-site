import type { Metadata } from "next";
import Link from "next/link";
import SermonGrid from "@/components/watch/SermonGrid";
import SeriesCard from "@/components/watch/SeriesCard";
import { toCardPiece, display, kicker } from "@/components/catalog/card";
import { getPublishedSermons } from "@/lib/sermons";
import { getPublishedSeries } from "@/lib/series";
import { searchLibrary, sermonsInSeries } from "@/lib/browse";

export const revalidate = 600;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search the library" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [pieces, series] = await Promise.all([getPublishedSermons(), getPublishedSeries()]);
  const r = searchLibrary(pieces, series, q);
  const total = r.messages.length + r.series.length + r.topics.length;

  return (
    <div className="flex-1 bg-[#0a0e10]">
      <section className="px-6 pb-16 pt-28 lg:px-10 lg:pt-32">
        <Link href="/" className={`${kicker} transition-colors hover:text-white`}>&larr; The library</Link>

        <form action="/library/search" method="get" className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl bg-white px-4 py-2 text-ink">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current text-ink/50" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
          <input name="q" defaultValue={q} placeholder="Search a topic, Scripture, series, or title" aria-label="Search the library" className="min-w-0 flex-1 bg-transparent py-2 text-[1rem] outline-none placeholder:text-ink/45" />
          <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">Search</button>
        </form>

        {!q.trim() ? (
          <p className="mt-10 text-white/55">Type anything above: a topic like &ldquo;prayer,&rdquo; a book like &ldquo;John,&rdquo; a series, or words from a title.</p>
        ) : total === 0 ? (
          <p className="mt-10 text-white/70">
            No matches for <span className="font-semibold text-white">&ldquo;{q}&rdquo;</span> yet. Try a broader term, or{" "}
            <Link href="/" className="text-secondary-soft underline">browse everything</Link>.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            <p className="text-sm text-white/55">
              {total} {total === 1 ? "result" : "results"} for <span className="font-semibold text-white">&ldquo;{q}&rdquo;</span>
            </p>

            {r.topics.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {r.topics.map((t) => (
                  <a key={t.slug} href={`/library/topics/${t.slug}`} className="rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/20">
                    Topic · {t.label} <span className="text-white/45">{t.count}</span>
                  </a>
                ))}
              </div>
            )}

            {r.series.length > 0 && (
              <div>
                <h2 className={`${display} mb-4 text-xl uppercase tracking-wide text-white`}>Series</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {r.series.map((se) => (
                    <SeriesCard key={se.id} series={se} count={sermonsInSeries(pieces, se).length} />
                  ))}
                </div>
              </div>
            )}

            {r.messages.length > 0 && (
              <div>
                <h2 className={`${display} mb-4 text-xl uppercase tracking-wide text-white`}>Pieces</h2>
                <SermonGrid sermons={r.messages.map(toCardPiece)} />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

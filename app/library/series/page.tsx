import type { Metadata } from "next";
import Link from "next/link";
import SeriesCard from "@/components/watch/SeriesCard";
import { display, kicker } from "@/components/catalog/card";
import { getPublishedSermons } from "@/lib/sermons";
import { getPublishedSeries } from "@/lib/series";
import { sermonsInSeries } from "@/lib/browse";
import { pathFor } from "@/lib/categories";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "All Series",
  description: "Every series from Austin W. Duncan, newest first.",
};

/* Full index of every published series, grouped by the year it ran (most recent
   first). Series are ordered by delivered date, not when they were added. */
export default async function AllSeriesPage() {
  const [pieces, series] = await Promise.all([getPublishedSermons(), getPublishedSeries()]);

  const delivered = (s: (typeof series)[number]) => s.endsOn ?? s.startsOn ?? "";
  const ordered = [...series].sort((a, b) => delivered(b).localeCompare(delivered(a)));

  const groups = new Map<string, typeof series>();
  for (const s of ordered) {
    const year = (delivered(s) || "").slice(0, 4) || "Undated";
    (groups.get(year) ?? groups.set(year, []).get(year)!).push(s);
  }

  return (
    <div className="min-h-screen bg-[#0a0e10] text-white">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-10">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className={kicker}>The library</p>
            <h1 className={`${display} mt-2 text-4xl uppercase tracking-wide sm:text-5xl`}>All series</h1>
            <p className="mt-2 text-sm text-white/60">{series.length} series, newest first.</p>
          </div>
          <Link href="/" className="shrink-0 text-xs font-semibold uppercase tracking-widest text-secondary-soft transition-colors hover:text-white">
            &larr; Back to the library
          </Link>
        </div>

        {[...groups.entries()].map(([year, list]) => (
          <section key={year} className="mt-12">
            <h2 className={`${display} mb-4 text-2xl uppercase tracking-wide text-white/85`}>{year}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((se) => {
                const inSeries = sermonsInSeries(pieces, se);
                return <SeriesCard key={se.id} series={se} count={inSeries.length} href={inSeries.length === 1 ? pathFor(inSeries[0]) : undefined} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

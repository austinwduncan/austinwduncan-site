import type { Metadata } from "next";
import Row from "@/components/watch/Row";
import SeriesCard from "@/components/watch/SeriesCard";
import SermonGrid from "@/components/watch/SermonGrid";
import ScriptureCoverage from "./ScriptureCoverage";
import TopicChips from "./TopicChips";
import { toCardPiece, display, kicker } from "./card";
import { getPublishedByCategory } from "@/lib/sermons";
import { getPublishedSeries } from "@/lib/series";
import { activeSeries, coverageFrom, sermonsInSeries, topicsFrom } from "@/lib/browse";
import { CATEGORIES, pathFor, type Category } from "@/lib/categories";

/* Metadata for a category page. The root layout template appends the site name. */
export function categoryMetadata(category: Category): Metadata {
  const c = CATEGORIES[category];
  return { title: c.label, description: c.blurb };
}

/*
  One category of the library: the header, the series whose pieces belong
  here, every published piece newest first, and the topics found in them.
  Sermons also get the Scripture coverage block.
*/
export default async function CategoryPage({ category }: { category: Category }) {
  const c = CATEGORIES[category];
  const [pieces, allSeries] = await Promise.all([getPublishedByCategory(category), getPublishedSeries()]);
  const series = activeSeries(allSeries, pieces);
  const topics = topicsFrom(pieces);
  const coverage = category === "sermon" ? coverageFrom(pieces) : [];
  const n = pieces.length;

  return (
    <div className="flex-1 bg-[#0a0e10]">
      <section className="px-6 pb-10 pt-28 lg:px-10 lg:pt-32">
        <p className={kicker}>The library</p>
        <h1 className={`${display} mt-1 text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-none tracking-tight text-white`}>{c.label}</h1>
        <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/65">{c.blurb}</p>
        <p className="mt-3 text-sm text-white/45">
          {n} {n === 1 ? c.noun : c.nouns}
        </p>
      </section>

      <div className="pb-16">
        {series.length > 0 && (
          <Row title="Series" href="/library/series" seeAll="See all series">
            {series.map((se, i) => {
              const inSeries = sermonsInSeries(pieces, se);
              return (
                <SeriesCard
                  key={se.id}
                  series={se}
                  count={inSeries.length}
                  href={inSeries.length === 1 ? pathFor(inSeries[0]) : undefined}
                  badge={i === 0 ? "Latest" : undefined}
                  className="w-64 shrink-0 snap-start sm:w-72"
                />
              );
            })}
          </Row>
        )}

        <section className="mt-12 px-6 lg:px-10">
          <h2 className={`${display} text-xl uppercase tracking-wide text-white sm:text-2xl`}>All {c.nouns}</h2>
          {n > 0 ? (
            <div className="mt-6">
              <SermonGrid sermons={pieces.map(toCardPiece)} />
            </div>
          ) : (
            <p className="mt-6 text-white/55">Nothing published here yet. Check back soon.</p>
          )}
        </section>

        {topics.length > 0 && (
          <section className="mt-14 px-6 lg:px-10">
            <p className={kicker}>By topic</p>
            <h2 className={`${display} mt-2 text-2xl uppercase tracking-wide text-white sm:text-3xl`}>Topics in {c.label}</h2>
            <TopicChips topics={topics} className="mt-5" />
          </section>
        )}

        {category === "sermon" && <ScriptureCoverage coverage={coverage} className="mt-14" />}
      </div>
    </div>
  );
}

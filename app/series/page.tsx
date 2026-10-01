import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSermons, type Sermon } from "@/lib/sermons";
import { getPublishedSeries, type Series } from "@/lib/series";
import { sermonsInSeries } from "@/lib/browse";
import { getSeriesBySlug } from "@/data/teaching-series";
import { PageHeader, pageStyle, wrap, INK, GOLD_INK, MIST } from "@/components/bright/PageHeader";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Series",
  description: "Teaching series by Austin W. Duncan: each one explained, with every session to read in order.",
};

async function load(): Promise<{ series: Series[]; pieces: Sermon[] }> {
  try {
    const [series, pieces] = await Promise.all([getPublishedSeries(), getPublishedSermons()]);
    return { series, pieces };
  } catch (e) {
    console.warn("[series] could not load", e);
    return { series: [], pieces: [] };
  }
}

export default async function SeriesIndexPage() {
  const { series, pieces } = await load();
  const rows = series
    .map((se) => ({ se, count: sermonsInSeries(pieces, se).length, guide: getSeriesBySlug(se.slug) }))
    .filter((r) => r.count > 0)
    .sort((a, b) => (a.guide?.priority ?? 99) - (b.guide?.priority ?? 99));

  return (
    <div style={pageStyle}>
      <PageHeader title="Series" count={rows.length} countLabel="to read through" />

      <div className={`${wrap} py-10 lg:py-14`}>
        <p style={{ fontSize: "clamp(1.25rem, 2vw, 1.9rem)", lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.015em", maxWidth: "30ch" }}>
          Each series works through a book of the Bible or a single theme, one session at a time, in writing.
        </p>
      </div>

      <ul className={`${wrap} pb-20 lg:pb-28`}>
        {rows.map(({ se, count, guide }) => (
          <li key={se.slug} style={{ borderTop: `3px solid ${INK}` }}>
            <Link
              href={`/series/${se.slug}`}
              className="group grid gap-6 py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 lg:py-10"
              style={{ outlineColor: INK }}
            >
              <span className="block overflow-hidden" style={{ background: MIST }}>
                {se.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={se.artworkUrl}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <span className="block aspect-video w-full" />
                )}
              </span>
              <span className="block">
                <span
                  className="block text-balance group-hover:underline group-hover:decoration-4 group-hover:underline-offset-8"
                  style={{ fontWeight: 800, fontSize: "clamp(2rem, 4.4vw, 4rem)", lineHeight: 0.92, letterSpacing: "-0.045em" }}
                >
                  {se.title}
                </span>
                {se.subtitle && (
                  <span className="mt-4 block max-w-[46ch] text-[1.1rem] leading-snug" style={{ color: "rgba(23,25,24,0.75)" }}>
                    {se.subtitle}
                  </span>
                )}
                <span className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[0.9rem] font-semibold">
                  <span>{count} sessions</span>
                  {guide?.status && <span style={{ color: GOLD_INK }}>{guide.status === "Complete" ? "Complete" : "Still being written"}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

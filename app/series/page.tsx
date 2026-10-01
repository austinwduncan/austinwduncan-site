import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSermons, type Sermon } from "@/lib/sermons";
import { getPublishedSeries, type Series } from "@/lib/series";
import { sermonsInSeries } from "@/lib/browse";
import { CATEGORIES, type Category } from "@/lib/categories";
import { Poster } from "@/components/bright/Poster";
import { PageHeader, pageStyle, wrap, h2Style, INK, GOLD_INK, MIST, DISPLAY, T3 } from "@/components/bright/PageHeader";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Series",
  description: "Teaching series, Word for Word, Forum & Pulpit and Exegetica by Austin W. Duncan.",
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

/*
  The other three kinds of writing sit beside the teaching series. Each is one
  category, so its page is the category page.
*/
const KINDS: { category: Category; id: string }[] = [
  { category: "episode", id: "word-for-word" },
  { category: "commentary", id: "forum-and-pulpit" },
  { category: "paper", id: "exegetica" },
];

export default async function SeriesIndexPage() {
  const { series, pieces } = await load();

  /*
    Teaching series, newest first by when they were written. A series with no
    end date is still being written (set or clear "Ends on" in the Series tab
    of the builder), and those lead the list.
  */
  const teaching = series
    .map((se) => {
      const sessions = sermonsInSeries(pieces, se);
      const firstDate = se.startsOn ?? sessions.map((s) => s.date).filter(Boolean).sort()[0] ?? "";
      return { se, count: sessions.length, firstDate, open: !se.endsOn };
    })
    .filter((r) => r.count === 0 || sermonsInSeries(pieces, r.se).some((s) => s.category === "teaching"))
    .sort((a, b) => {
      if (!a.firstDate || !b.firstDate) return a.firstDate ? 1 : b.firstDate ? -1 : 0;
      return b.firstDate.localeCompare(a.firstDate);
    });

  const kinds = KINDS.map((k) => ({ ...k, info: CATEGORIES[k.category], count: pieces.filter((p) => p.category === k.category).length })).filter(
    (k) => k.count > 0,
  );

  return (
    <div style={pageStyle}>
      <PageHeader title="Series" />

      {/* ── Teaching series: a grid, newest first ──────────────────────────── */}
      <section id="teaching-series" className="scroll-mt-20">
        <div className={`${wrap} pb-8 pt-10 lg:pt-12`}>
          <h2 style={h2Style}>Teaching series</h2>
          <p className="mt-3 max-w-[54ch] text-[1.05rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
            Each one works through a book of the Bible or a single theme, one session at a time, in writing.
          </p>
        </div>
        <ul className={`${wrap} grid gap-x-8 gap-y-12 pb-16 sm:grid-cols-2 lg:grid-cols-3 lg:pb-24`}>
          {teaching.map(({ se, count, open }) => (
            <li key={se.slug}>
              <Link
                href={`/series/${se.slug}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{ outlineColor: INK }}
              >
                <span className="relative block overflow-hidden" style={{ background: MIST }}>
                  <Poster
                    piece={{ title: se.title, passage: "", artworkUrl: se.artworkUrl, heroStillUrl: undefined, seriesArtworkUrl: undefined }}
                    size="lg"
                    className="transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {open && (
                    <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.75rem] font-semibold" style={{ background: "#FFFFFF", color: GOLD_INK }}>
                      Still being written
                    </span>
                  )}
                </span>
                <span
                  className="mt-4 block text-balance group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
                  style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: T3, lineHeight: 1, letterSpacing: "0.01em" }}
                >
                  {se.title}
                </span>
                {se.subtitle && (
                  <span className="mt-2 block text-[0.98rem] leading-snug" style={{ color: "rgba(28,36,39,0.72)" }}>
                    {se.subtitle}
                  </span>
                )}
                <span className="mt-3 block text-[0.85rem] font-semibold" style={{ color: GOLD_INK }}>
                  {count > 0 ? `${count} sessions` : "First session on the way"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── The other three kinds of writing ───────────────────────────────── */}
      {kinds.length > 0 && (
        <section style={{ background: MIST }}>
          <div className={`${wrap} py-16 lg:py-20`}>
            <h2 style={h2Style}>More to read</h2>
            <ul className="mt-8 grid gap-6 lg:grid-cols-3">
              {kinds.map((k) => (
                <li key={k.id} id={k.id} className="scroll-mt-20">
                  <Link
                    href={`/${k.info.path}`}
                    className="group flex h-full flex-col bg-white p-7 transition-colors duration-150 hover:bg-[#1C2427] hover:text-white focus-visible:bg-[#1C2427] focus-visible:text-white focus-visible:outline-none"
                    style={{ borderTop: `3px solid ${INK}` }}
                  >
                    <span style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: T3, lineHeight: 1, letterSpacing: "0.01em" }}>
                      {k.info.label}
                    </span>
                    <span className="mt-3 block flex-1 text-[0.98rem] leading-relaxed opacity-75">{k.info.blurb}</span>
                    <span className="mt-6 block text-[0.85rem] font-semibold group-hover:text-[#9DB4C8] group-focus-visible:text-[#9DB4C8]" style={{ color: GOLD_INK }}>
                      {k.count} {k.info.nouns}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

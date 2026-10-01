import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSermons, type Sermon } from "@/lib/sermons";
import { getPublishedSeries, type Series } from "@/lib/series";
import { sermonsInSeries } from "@/lib/browse";
import { CATEGORIES, pathFor, type Category } from "@/lib/categories";
import { Poster } from "@/components/bright/Poster";
import { PageHeader, PillLink, pageStyle, wrap, h2Style, INK, GOLD_INK, MIST, DISPLAY } from "@/components/bright/PageHeader";

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

function fmt(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  return Number.isNaN(d.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(d);
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

  return (
    <div style={pageStyle}>
      <PageHeader title="Series" />

      <div className={`${wrap} flex flex-wrap gap-3 py-8 lg:py-10`}>
        <PillLink href="#teaching-series">Teaching series</PillLink>
        {KINDS.map((k) => (
          <PillLink key={k.id} href={`#${k.id}`} tone="outline">
            {CATEGORIES[k.category].label}
          </PillLink>
        ))}
      </div>

      {/* ── Teaching series ────────────────────────────────────────────────── */}
      <section id="teaching-series" className="scroll-mt-20">
        <div className={`${wrap} pb-6`}>
          <h2 style={h2Style}>Teaching series</h2>
          <p className="mt-4 max-w-[54ch] text-[1.08rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
            Each one works through a book of the Bible or a single theme, one session at a time, in writing.
          </p>
        </div>
        <ul className={`${wrap} pb-16 lg:pb-24`}>
          {teaching.map(({ se, count, open }) => (
            <li key={se.slug} style={{ borderTop: `3px solid ${INK}` }}>
              <Link
                href={`/series/${se.slug}`}
                className="group grid gap-6 py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14 lg:py-10"
                style={{ outlineColor: INK }}
              >
                <span className="block overflow-hidden" style={{ background: MIST }}>
                  <Poster
                    piece={{ title: se.title, passage: "", artworkUrl: se.artworkUrl, heroStillUrl: undefined, seriesArtworkUrl: undefined }}
                    size="lg"
                    className="transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </span>
                <span className="block">
                  {open && (
                    <span className="mb-3 inline-block rounded-full px-3 py-1 text-[0.78rem] font-semibold" style={{ background: MIST, color: GOLD_INK }}>
                      Still being written
                    </span>
                  )}
                  <span
                    className="block text-balance group-hover:underline group-hover:decoration-4 group-hover:underline-offset-8"
                    style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(2.6rem, 5.6vw, 5.2rem)", lineHeight: 0.9, letterSpacing: "0.01em" }}
                  >
                    {se.title}
                  </span>
                  {se.subtitle && (
                    <span className="mt-4 block max-w-[46ch] text-[1.1rem] leading-snug" style={{ color: "rgba(28,36,39,0.75)" }}>
                      {se.subtitle}
                    </span>
                  )}
                  <span className="mt-5 block text-[0.9rem] font-semibold">
                    {count > 0 ? `${count} sessions` : "First session on the way"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Word for Word, Forum & Pulpit, Exegetica ───────────────────────── */}
      {KINDS.map((k, i) => {
        const info = CATEGORIES[k.category];
        const list = pieces.filter((p) => p.category === k.category);
        if (list.length === 0) return null;
        return (
          <section key={k.id} id={k.id} className="scroll-mt-20" style={{ background: i % 2 === 0 ? MIST : "#FFFFFF" }}>
            <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:py-24`}>
              <div>
                <h2 style={h2Style}>{info.label}</h2>
                <p className="mt-4 max-w-[40ch] text-[1.08rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
                  {info.blurb}
                </p>
                <div className="mt-8">
                  <PillLink href={`/${info.path}`}>See all {list.length}</PillLink>
                </div>
              </div>
              <ul style={{ borderTop: `3px solid ${INK}` }}>
                {list.slice(0, 5).map((p) => (
                  <li key={p.slug} style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
                    <Link
                      href={pathFor(p)}
                      className="group flex items-baseline justify-between gap-6 px-2 py-4 transition-colors duration-150 hover:bg-[#1C2427] hover:text-white focus-visible:bg-[#1C2427] focus-visible:text-white focus-visible:outline-none"
                    >
                      <span className="text-[1.1rem] font-semibold leading-snug tracking-[-0.015em] lg:text-[1.2rem]">{p.title}</span>
                      <span className="hidden shrink-0 text-[0.85rem] tabular-nums opacity-60 sm:block">{fmt(p.date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}

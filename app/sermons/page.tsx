import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedByCategory, type Sermon } from "@/lib/sermons";
import { pathFor } from "@/lib/categories";
import { Poster } from "@/components/bright/Poster";
import { PageHeader, PillLink, pageStyle, wrap, h2Style, INK, GOLD_INK, MIST } from "@/components/bright/PageHeader";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Sermons",
  description: "Sermons preached by Austin W. Duncan, each with the video and the full text.",
};

function fmt(iso?: string, withYear = true): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(d);
}

async function load(): Promise<Sermon[]> {
  try {
    return await getPublishedByCategory("sermon");
  } catch (e) {
    console.warn("[sermons] could not load", e);
    return [];
  }
}

export default async function SermonsPage() {
  const sermons = await load();
  const [latest, ...rest] = sermons;

  // group everything, newest first, under its year
  const years = new Map<string, Sermon[]>();
  for (const s of sermons) {
    const y = s.date?.slice(0, 4) ?? "Undated";
    years.set(y, [...(years.get(y) ?? []), s]);
  }

  return (
    <div style={pageStyle}>
      <PageHeader title="Sermons" count={sermons.length} countLabel="with the full text" />

      {/* ── The newest one ─────────────────────────────────────────────────── */}
      {latest && (
        <section className={`${wrap} grid gap-8 py-12 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14 lg:py-16`}>
          <Link href={pathFor(latest)} className="group block overflow-hidden" style={{ background: MIST }}>
            <Poster piece={latest} size="lg" lazy={false} className="transition-transform duration-500 group-hover:scale-[1.02]" />
          </Link>
          <div>
            <p className="text-[0.9rem] font-semibold" style={{ color: GOLD_INK }}>
              Most recent, {fmt(latest.date)}
            </p>
            <h2 className="mt-3 text-balance" style={{ ...h2Style, fontSize: "clamp(2rem, 4vw, 3.6rem)" }}>
              <Link href={pathFor(latest)} className="hover:underline hover:decoration-4 hover:underline-offset-8">
                {latest.title}
              </Link>
            </h2>
            {latest.passage && <p className="mt-4 text-[1.05rem] font-semibold">{latest.passage}</p>}
            {(latest.summary || latest.description) && (
              <p className="mt-4 line-clamp-4 max-w-[58ch] text-[1.02rem] leading-relaxed" style={{ color: "rgba(23,25,24,0.72)" }}>
                {latest.summary || latest.description}
              </p>
            )}
            <div className="mt-8">
              <PillLink href={pathFor(latest)}>{latest.youtubeId ? "Watch and read" : "Read the sermon"}</PillLink>
            </div>
          </div>
        </section>
      )}

      {/* ── Every sermon, by year ──────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section style={{ background: MIST }}>
          <div className={`${wrap} py-16 lg:py-24`}>
            <h2 style={h2Style}>All sermons</h2>
            <div className="mt-10 space-y-14">
              {[...years.entries()].map(([year, list]) => (
                <div key={year} className="grid gap-4 lg:grid-cols-[11rem_1fr] lg:gap-10">
                  <p
                    className="tabular-nums lg:sticky lg:top-24 lg:self-start"
                    style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.6rem)", lineHeight: 0.9, letterSpacing: "-0.05em" }}
                  >
                    {year}
                  </p>
                  <ul style={{ borderTop: `3px solid ${INK}` }}>
                    {list.map((s) => (
                      <li key={s.slug} style={{ borderBottom: "1px solid rgba(23,25,24,0.16)" }}>
                        <Link
                          href={pathFor(s)}
                          className="group grid grid-cols-[6.5rem_1fr] items-center gap-4 px-2 py-3 transition-colors duration-150 hover:bg-[#171918] hover:text-white focus-visible:bg-[#171918] focus-visible:text-white focus-visible:outline-none sm:grid-cols-[9rem_1fr_auto] sm:gap-6"
                        >
                          <Poster piece={s} />
                          <span>
                            <span className="block text-[1.1rem] font-semibold leading-snug tracking-[-0.015em] lg:text-[1.25rem]">{s.title}</span>
                            {s.passage && (
                              <span className="mt-1 block text-[0.9rem] font-semibold group-hover:text-[#CDB079] group-focus-visible:text-[#CDB079]" style={{ color: GOLD_INK }}>
                                {s.passage}
                              </span>
                            )}
                            <span className="mt-1 block text-[0.85rem] opacity-60 sm:hidden">{fmt(s.date)}</span>
                          </span>
                          <span className="hidden text-right text-[0.9rem] tabular-nums opacity-60 sm:block">{fmt(s.date, false)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Two other ways in ──────────────────────────────────────────────── */}
      <section style={{ background: INK, color: "#FFFFFF" }}>
        <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-2 lg:py-24`}>
          <div>
            <h2 style={h2Style}>Looking for a passage?</h2>
            <p className="mt-5 max-w-[44ch] text-[1rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              See every book of the Bible I have preached or taught from, chapter by chapter.
            </p>
            <div className="mt-7"><PillLink href="/library/bible" tone="gold">Browse by Scripture</PillLink></div>
          </div>
          <div>
            <h2 style={h2Style}>Want to go book by book?</h2>
            <p className="mt-5 max-w-[44ch] text-[1rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              The teaching series walk through a book or a theme one session at a time, in writing.
            </p>
            <div className="mt-7"><PillLink href="/series" tone="gold">See the series</PillLink></div>
          </div>
        </div>
      </section>
    </div>
  );
}

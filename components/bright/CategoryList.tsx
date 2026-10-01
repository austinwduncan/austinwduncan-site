import type { ReactNode } from "react";
import Link from "next/link";
import { getPublishedByCategory, type Sermon } from "@/lib/sermons";
import { CATEGORIES, pathFor, type Category } from "@/lib/categories";
import { Poster } from "@/components/bright/Poster";
import { PageHeader, PillLink, pageStyle, wrap, h2Style, INK, GOLD_INK, MIST, DISPLAY } from "@/components/bright/PageHeader";

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

async function load(category: Category): Promise<Sermon[]> {
  try {
    return await getPublishedByCategory(category);
  } catch (e) {
    console.warn(`[${category}] could not load`, e);
    return [];
  }
}

/*
  One page design for every kind of writing: the newest piece up top, then
  everything by year. Sermons, Word for Word, Forum & Pulpit and Exegetica all
  render through this, so they cannot drift apart.
*/
export default async function CategoryList({
  category,
  title,
  countLabel,
  footer,
}: {
  category: Category;
  title: string;
  countLabel: string;
  footer?: ReactNode;
}) {
  const info = CATEGORIES[category];
  const sermons = await load(category);
  const [latest, ...rest] = sermons;

  // group everything, newest first, under its year
  const years = new Map<string, Sermon[]>();
  for (const s of sermons) {
    const y = s.date?.slice(0, 4) ?? "Undated";
    years.set(y, [...(years.get(y) ?? []), s]);
  }

  return (
    <div style={pageStyle}>
      <PageHeader title={title} count={sermons.length} countLabel={countLabel} />

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
            <h2 className="mt-3 text-balance" style={{ ...h2Style, fontSize: "clamp(1.9rem, 3vw, 2.6rem)" }}>
              <Link href={pathFor(latest)} className="hover:underline hover:decoration-4 hover:underline-offset-8">
                {latest.title}
              </Link>
            </h2>
            {latest.passage && <p className="mt-4 text-[1.05rem] font-semibold">{latest.passage}</p>}
            {(latest.summary || latest.description) && (
              <p className="mt-4 line-clamp-4 max-w-[58ch] text-[1.02rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.72)" }}>
                {latest.summary || latest.description}
              </p>
            )}
            <div className="mt-8">
              <PillLink href={pathFor(latest)}>{latest.youtubeId ? "Watch and read" : `Read the ${info.noun}`}</PillLink>
            </div>
          </div>
        </section>
      )}

      {/* ── Every sermon, by year ──────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section style={{ background: MIST }}>
          <div className={`${wrap} py-16 lg:py-24`}>
            <h2 style={h2Style}>All {info.nouns}</h2>
            <div className="mt-10 space-y-14">
              {[...years.entries()].map(([year, list]) => (
                <div key={year} className="grid gap-4 lg:grid-cols-[11rem_1fr] lg:gap-10">
                  <p
                    className="tabular-nums lg:sticky lg:top-24 lg:self-start"
                    style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(1.9rem, 3vw, 2.6rem)", lineHeight: 0.9, letterSpacing: "0.01em" }}
                  >
                    {year}
                  </p>
                  <ul style={{ borderTop: `3px solid ${INK}` }}>
                    {list.map((s) => (
                      <li key={s.slug} style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
                        <Link
                          href={pathFor(s)}
                          className="group grid grid-cols-[6.5rem_1fr] items-center gap-4 px-2 py-3 transition-colors duration-150 hover:bg-[#1C2427] hover:text-white focus-visible:bg-[#1C2427] focus-visible:text-white focus-visible:outline-none sm:grid-cols-[9rem_1fr_auto] sm:gap-6"
                        >
                          <Poster piece={s} />
                          <span>
                            <span className="block text-[1.1rem] font-semibold leading-snug tracking-[-0.015em] lg:text-[1.25rem]">{s.title}</span>
                            {s.passage && (
                              <span className="mt-1 block text-[0.9rem] font-semibold group-hover:text-[#7B9BB5] group-focus-visible:text-[#7B9BB5]" style={{ color: GOLD_INK }}>
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

      {footer}
    </div>
  );
}

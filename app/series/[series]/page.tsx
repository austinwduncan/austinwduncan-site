import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedSermons, type Sermon } from "@/lib/sermons";
import { getPublishedSeries, getSeries } from "@/lib/series";
import { sermonsInSeries } from "@/lib/browse";
import { pathFor } from "@/lib/categories";
import { getSeriesBySlug } from "@/data/teaching-series";
import { PageHeader, PillLink, pageStyle, wrap, h2Style, INK, GOLD_INK, MIST, DISPLAY } from "@/components/bright/PageHeader";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }): Promise<Metadata> {
  const { series } = await params;
  const se = await getSeries(series);
  if (!se) return {};
  return {
    title: se.title,
    description: se.description || se.subtitle || `The ${se.title} series by Austin W. Duncan.`,
    ...(se.artworkUrl ? { openGraph: { images: [se.artworkUrl] } } : {}),
  };
}

/** Sessions in reading order: by week when set, then by date. */
function inOrder(items: Sermon[]): Sermon[] {
  return [...items].sort((a, b) => {
    const wa = a.week ?? Number.MAX_SAFE_INTEGER;
    const wb = b.week ?? Number.MAX_SAFE_INTEGER;
    if (wa !== wb) return wa - wb;
    return (a.date ?? "").localeCompare(b.date ?? "");
  });
}

function SessionRow({ s, n }: { s: Sermon; n: number }) {
  return (
    <li style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
      <Link
        href={pathFor(s)}
        className="group grid grid-cols-[2.6rem_1fr] items-baseline gap-4 px-2 py-4 transition-colors duration-150 hover:bg-[#1C2427] hover:text-white focus-visible:bg-[#1C2427] focus-visible:text-white focus-visible:outline-none sm:grid-cols-[3.4rem_1fr_auto] sm:gap-6"
      >
        <span
          className="tabular-nums group-hover:text-[#7B9BB5] group-focus-visible:text-[#7B9BB5]"
          style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: "1.5rem", letterSpacing: "0.01em", color: GOLD_INK }}
        >
          {n}
        </span>
        <span>
          <span className="block text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] lg:text-[1.3rem]">{s.title}</span>
          {(s.summary || s.description) && (
            <span className="mt-1 line-clamp-2 block max-w-[70ch] text-[0.95rem] leading-relaxed opacity-70">
              {s.summary || s.description}
            </span>
          )}
        </span>
        {s.passage && <span className="hidden text-right text-[0.9rem] font-semibold opacity-70 sm:block">{s.passage}</span>}
      </Link>
    </li>
  );
}

export default async function SeriesPage({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  const [se, pieces, allSeries] = await Promise.all([getSeries(series), getPublishedSermons(), getPublishedSeries()]);
  if (!se) notFound();

  const sessions = inOrder(sermonsInSeries(pieces, se));
  const guide = getSeriesBySlug(se.slug);
  const first = sessions[0];
  // No end date means the series is still being written (set in the builder).
  const open = !se.endsOn;
  const why = guide?.whyStudy || se.description;

  // Group sessions under the guide's roadmap parts when it has one. A part
  // names its sessions by number, which is the session's week.
  const byNumber = new Map<number, Sermon>();
  sessions.forEach((s, i) => byNumber.set(s.week ?? i + 1, s));
  const parts = (guide?.roadmap ?? [])
    .map((p) => ({ ...p, items: p.sessions.map((n) => ({ n, s: byNumber.get(n) })).filter((x): x is { n: number; s: Sermon } => Boolean(x.s)) }))
    .filter((p) => p.items.length > 0);
  const grouped = new Set(parts.flatMap((p) => p.items.map((x) => x.s.slug)));
  const ungrouped = sessions.filter((s) => !grouped.has(s.slug));

  const related = (guide?.relatedSeries ?? [])
    .map((slug) => allSeries.find((x) => x.slug === slug))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const others = related.length > 0 ? related : allSeries.filter((x) => x.slug !== se.slug && sermonsInSeries(pieces, x).length > 0).slice(0, 3);

  return (
    <div style={pageStyle}>
      <PageHeader
        title={se.title}
        size="lg"
        count={sessions.length > 0 ? sessions.length : undefined}
        countLabel={open ? "sessions so far" : "sessions"}
        crumbs={[{ href: "/series", label: "Series" }, { label: se.title }]}
      />

      {/* ── What this series is ────────────────────────────────────────────── */}
      <section className={`${wrap} grid gap-10 py-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16 lg:py-16`}>
        <div>
          {open && (
            <p className="mb-5 inline-block rounded-full px-3 py-1 text-[0.8rem] font-semibold" style={{ background: MIST, color: GOLD_INK }}>
              Still being written
            </p>
          )}
          {se.subtitle && (
            <p className="text-balance" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.4rem)", lineHeight: 1.18, fontWeight: 700, letterSpacing: "-0.025em" }}>
              {se.subtitle}
            </p>
          )}
          {why && (
            <p className="mt-6 max-w-[60ch] text-[1.08rem] leading-[1.75]" style={{ color: "rgba(28,36,39,0.8)" }}>
              {why}
            </p>
          )}
          {first && (
            <div className="mt-9 flex flex-wrap gap-3">
              <PillLink href={pathFor(first)}>Start with session 1</PillLink>
              <PillLink href="#sessions" tone="outline">See all {sessions.length}</PillLink>
            </div>
          )}
        </div>
        {se.artworkUrl && (
          <div className="overflow-hidden" style={{ background: MIST }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={se.artworkUrl} alt="" className="aspect-video w-full object-cover" />
          </div>
        )}
      </section>

      {/* ── Who it is for, what you take away ──────────────────────────────── */}
      {guide && (guide.bestFor.length > 0 || guide.outcomes.length > 0) && (
        <section style={{ background: MIST }}>
          <div className={`${wrap} grid gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20`}>
            {guide.bestFor.length > 0 && (
              <div>
                <h2 style={h2Style}>Who it is for</h2>
                <ul className="mt-8" style={{ borderTop: `3px solid ${INK}` }}>
                  {guide.bestFor.map((t) => (
                    <li key={t} className="py-4 text-[1.08rem] leading-snug" style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {guide.outcomes.length > 0 && (
              <div>
                <h2 style={h2Style}>What you will take away</h2>
                <ul className="mt-8" style={{ borderTop: `3px solid ${INK}` }}>
                  {guide.outcomes.map((t) => (
                    <li key={t} className="py-4 text-[1.08rem] leading-snug" style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── The sessions, in order ─────────────────────────────────────────── */}
      <section id="sessions" className="scroll-mt-20">
        <div className={`${wrap} py-16 lg:py-24`}>
          <h2 style={h2Style}>The sessions</h2>
          {sessions.length === 0 && (
            <p className="mt-6 max-w-[50ch] text-[1.08rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
              The first session is being written. It will appear here as soon as it is published.
            </p>
          )}

          {parts.map((p) => (
            <div key={p.title} className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-14">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <h3 className="text-balance" style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(1.5rem, 2.1vw, 1.9rem)", lineHeight: 1.05, letterSpacing: "0.01em" }}>
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[40ch] text-[0.98rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.7)" }}>
                  {p.description}
                </p>
              </div>
              <ol style={{ borderTop: `3px solid ${INK}` }}>
                {p.items.map(({ n, s }) => (
                  <SessionRow key={s.slug} s={s} n={n} />
                ))}
              </ol>
            </div>
          ))}

          {ungrouped.length > 0 && (
            <ol className="mt-12" style={{ borderTop: `3px solid ${INK}` }}>
              {ungrouped.map((s) => (
                <SessionRow key={s.slug} s={s} n={s.week ?? sessions.indexOf(s) + 1} />
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── How to use it ──────────────────────────────────────────────────── */}
      {guide && guide.howToUse.length > 0 && (
        <section style={{ background: MIST }}>
          <div className={`${wrap} grid gap-8 py-16 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-14 lg:py-20`}>
            <h2 style={h2Style}>How to use it</h2>
            <ul style={{ borderTop: `3px solid ${INK}` }}>
              {guide.howToUse.map((t) => (
                <li key={t} className="py-4 text-[1.08rem] leading-snug" style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Where to go next ───────────────────────────────────────────────── */}
      {others.length > 0 && (
        <section style={{ background: INK, color: "#FFFFFF" }}>
          <div className={`${wrap} py-16 lg:py-24`}>
            <h2 style={h2Style}>Read next</h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/series/${o.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" style={{ outlineColor: "#7B9BB5" }}>
                    {o.artworkUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.artworkUrl} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                    )}
                    <span className="mt-4 block text-[1.4rem] font-bold leading-tight tracking-[-0.02em] group-hover:text-[#7B9BB5]">{o.title}</span>
                    {o.subtitle && <span className="mt-2 block text-[0.95rem] leading-snug text-white/65">{o.subtitle}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-12"><PillLink href="/series" tone="gold">All series</PillLink></div>
          </div>
        </section>
      )}
    </div>
  );
}

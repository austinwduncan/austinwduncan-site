import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Scripture from "@/components/Scripture";
import SermonToc from "@/components/SermonToc";
import SermonChapters from "@/components/SermonChapters";
import SermonReveal from "@/components/SermonReveal";
import SermonHero from "@/components/SermonHero";
import SermonNotes from "@/components/SermonNotes";
import SermonParagraph from "@/components/SermonParagraph";
import SermonHeading from "@/components/SermonHeading";
import SermonScripture from "@/components/SermonScripture";
import { getSermon, parseSermonBody, sermonSections, readingTime } from "@/lib/sermons";
import { getSeries } from "@/lib/series";
import { CATEGORIES, pathFor, type Category } from "@/lib/categories";
import { SITE_URL } from "@/lib/site-url";
import { optimizedImg } from "@/lib/img";
import { fmtDate } from "./card";

/*
  One piece of the library, at /{category path}/[slug]. The five route files
  are thin wrappers that pass their category; a piece fetched under the wrong
  category path is permanently redirected to its canonical URL.
*/

/** Metadata for a piece page. The root layout template appends the site name. */
export async function pieceMetadata(slug: string): Promise<Metadata> {
  const s = await getSermon(slug);
  if (!s) return {};
  const art = s.artworkUrl ?? s.seriesArtworkUrl;
  return {
    title: s.title,
    description: s.summary,
    // Cross-domain canonical: a piece published elsewhere first keeps that copy
    // as the canonical one for search engines.
    alternates: { canonical: s.canonicalUrl ?? pathFor(s) },
    openGraph: {
      title: s.title,
      description: s.summary,
      type: "article",
      ...(art ? { images: [art] } : {}),
    },
  };
}

export default async function PiecePage({ slug, category }: { slug: string; category: Category }) {
  const s = await getSermon(slug);
  if (!s) notFound();
  if (s.category !== category) permanentRedirect(pathFor(s));

  const cat = CATEGORIES[category];
  const blocks = parseSermonBody(s.body);
  const sections = sermonSections(s.body);
  const mins = readingTime(s.body);
  const dateLabel = fmtDate(s.date);
  const canonical = s.canonicalUrl ?? `${SITE_URL}${pathFor(s)}`;
  const seriesLabel = s.seriesTitle ?? s.series;
  // Hero backdrop: a still from the video (its thumbnail), falling back to artwork.
  const heroBackdrop = optimizedImg(
    s.youtubeId ? `https://i.ytimg.com/vi/${s.youtubeId}/maxresdefault.jpg` : s.artworkUrl ?? s.seriesArtworkUrl,
    1200,
  );
  const hasArticle = blocks.some((b) => b.type !== "heading");
  const hasChapters = sections.filter((sec) => sec.t != null).length >= 2;
  // Series background (behind the speaker on the hero). Looked up separately so a
  // pre-migration missing column can't break the piece query.
  const seriesData = s.seriesSlug ? await getSeries(s.seriesSlug) : null;
  const seriesBackground = optimizedImg(seriesData?.backgroundUrl, 1200);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: s.title,
    description: s.summary,
    author: { "@type": "Person", name: s.speaker },
    publisher: { "@type": "Organization", name: "Austin W. Duncan", url: SITE_URL },
    mainEntityOfPage: canonical,
    ...(s.date ? { datePublished: s.date } : {}),
    articleSection: seriesLabel ?? cat.label,
  };
  const videoLd = s.youtubeId
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: s.title,
        description: s.summary,
        thumbnailUrl: `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${s.youtubeId}`,
        ...(s.date ? { uploadDate: s.date } : {}),
      }
    : null;

  return (
    <>
      <SermonScripture />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {videoLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />}

      <div className="flex-1 bg-white">
        <SermonHero
          seriesLabel={seriesLabel}
          title={s.title}
          lede={s.subtitle || s.summary}
          speaker={s.speaker}
          dateLabel={dateLabel}
          date={s.date}
          passage={s.passage}
          mins={mins}
          youtubeId={s.youtubeId}
          start={sections[0]?.t}
          backdrop={heroBackdrop}
          heroStill={optimizedImg(s.heroStillUrl, 1080)}
          heroCutout={optimizedImg(s.heroCutoutUrl, 1080)}
          heroFocalX={s.heroFocalX}
          heroFocalY={s.heroFocalY}
          seriesBackground={seriesBackground}
          hasArticle={hasArticle}
          hasChapters={hasChapters}
          backHref={`/${cat.path}`}
          backLabel={`All ${cat.nouns}`}
          watchLabel={`Watch the ${cat.noun}`}
        />

        {/* the text, right below the hero */}
        {hasArticle && (
          <section id="read" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 lg:px-10 lg:py-24">
            <div className="lg:grid lg:grid-cols-[1fr_15rem] lg:gap-14">
              <SermonReveal>
                <article data-sermon className="max-w-2xl">
                  <p className="mb-8 font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.3em] text-accent">
                    Read the {cat.noun} · {mins} min
                  </p>
                  {blocks.map((b, i) => {
                    if (b.type === "heading") {
                      return <SermonHeading key={i} id={b.id} text={b.text} t={b.t} hasVideo={Boolean(s.youtubeId)} />;
                    }
                    if (b.type === "subheading") {
                      return (
                        <h3 key={i} className="mt-10 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-ink">
                          {b.text}
                        </h3>
                      );
                    }
                    if (b.type === "image") {
                      const img = <img src={b.src} alt={b.alt} loading="lazy" className="max-h-72 w-auto rounded-md" />;
                      return (
                        <figure key={i} className="mt-8">
                          {b.href ? <a href={b.href} target="_blank" rel="noopener noreferrer">{img}</a> : img}
                          {b.alt && <figcaption className="mt-2 text-xs text-ink/55">{b.alt}</figcaption>}
                        </figure>
                      );
                    }
                    if (b.type === "scripture") {
                      return (
                        <Scripture key={i} reference={b.reference}>
                          {b.text}
                        </Scripture>
                      );
                    }
                    return <SermonParagraph key={i} text={b.text} className="mt-5 text-[1.075rem] leading-relaxed text-ink/85" />;
                  })}

                  {s.topics && s.topics.length > 0 && (
                    <div className="mt-12 flex flex-wrap gap-2">
                      {s.topics.map((t) => (
                        <span key={t} className="rounded-full bg-ink/[0.06] px-3 py-1 text-xs font-semibold text-ink/70">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-14 border-t border-ink/10 pt-8">
                    <Link href={`/${cat.path}`} className="text-sm font-semibold uppercase tracking-widest text-accent transition-colors hover:text-ink">
                      &larr; All {cat.nouns}
                    </Link>
                  </div>
                </article>
              </SermonReveal>

              {/* sticky TOC on desktop */}
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <SermonToc sections={sections} />
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* chapters + resources band */}
        {((s.youtubeId && hasChapters) || s.documentUrl || s.webLink1Url || s.webLink2Url) && (
          <section
            className="px-6 py-14 lg:px-[clamp(1.5rem,5vw,4.75rem)]"
            style={{ background: "radial-gradient(circle at 70% 8%, rgba(123,155,181,0.10), transparent 26rem), #080a0e" }}
          >
            {s.youtubeId && hasChapters && (
              <div id="chapters" className="scroll-mt-24 text-white">
                <SermonChapters sections={sections} youtubeId={s.youtubeId} />
              </div>
            )}
            {(s.documentUrl || s.webLink1Url || s.webLink2Url) && (
              <div className={`flex flex-wrap gap-3 ${s.youtubeId && hasChapters ? "mt-8" : ""}`}>
                {s.documentUrl && (
                  <a
                    href={s.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
                  >
                    <span aria-hidden>↓</span> {s.documentName || "Study guide"}
                  </a>
                )}
                {[
                  [s.webLink1Url, s.webLink1Label],
                  [s.webLink2Url, s.webLink2Label],
                ].map(([url, lbl], i) =>
                  url ? (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
                    >
                      {lbl || "Link"} <span aria-hidden>↗</span>
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </section>
        )}

        <SermonNotes slug={s.slug} title={s.title} />
      </div>
    </>
  );
}

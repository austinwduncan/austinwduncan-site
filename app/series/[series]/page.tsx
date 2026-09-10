import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SermonCard from "@/components/watch/SermonCard";
import { getPublishedSermons } from "@/lib/sermons";
import { getSeries } from "@/lib/series";
import { sermonsInSeries } from "@/lib/browse";
import { pathFor } from "@/lib/categories";
import { optimizedImg } from "@/lib/img";

export const revalidate = 600;

const display = "font-[family-name:var(--font-display)]";

function d(iso?: string): Date | null {
  if (!iso) return null;
  const x = new Date(iso + "T12:00:00Z");
  return Number.isNaN(x.getTime()) ? null : x;
}
function fmtRange(startsOn?: string, endsOn?: string): string | null {
  const s = d(startsOn);
  const e = d(endsOn);
  const opt: Intl.DateTimeFormatOptions = { timeZone: "UTC", month: "short", day: "numeric" };
  const yr: Intl.DateTimeFormatOptions = { ...opt, year: "numeric" };
  if (s && e) {
    const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
    return `${new Intl.DateTimeFormat("en-US", sameYear ? opt : yr).format(s)} to ${new Intl.DateTimeFormat("en-US", yr).format(e)}`;
  }
  const one = s ?? e;
  return one ? new Intl.DateTimeFormat("en-US", yr).format(one) : null;
}

// Cards keep a fixed width (the 4-up size). Split the series into centered rows
// of at most four, as evenly as possible with the fuller rows first, so the last
// row is never a lonely card: five becomes 3 + 2, ten becomes 4 + 3 + 3, etc.
function balancedRows(n: number): number[] {
  if (n <= 0) return [];
  const rows = Math.ceil(n / 4);
  const base = Math.floor(n / rows);
  const extra = n % rows;
  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));
}

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }): Promise<Metadata> {
  const { series } = await params;
  const se = await getSeries(series);
  if (!se) return {};
  return {
    title: `${se.title} series`,
    description: se.description || `The ${se.title} series from Austin W. Duncan.`,
    ...(se.artworkUrl ? { openGraph: { images: [se.artworkUrl] } } : {}),
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  const [se, sermons] = await Promise.all([getSeries(series), getPublishedSermons()]);
  if (!se) notFound();
  const items = sermonsInSeries(sermons, se);
  // A single-piece "series" is really just that piece, so go straight to it.
  if (items.length === 1) redirect(pathFor(items[0]));
  const banner = optimizedImg(se.bannerUrl ?? se.artworkUrl, 1920);

  return (
    <>
      <div className="flex-1 bg-[#0a0e10]">
        {/* Wide banner. The artwork/banner carries the series title, so no big
            overlaid heading. A meta bar hovers between the banner and the grid. */}
        <h1 className="sr-only">{se.title}</h1>
        <section className="relative">
          <div className="relative w-full overflow-hidden bg-primary-deep pt-16 lg:pt-[4.5rem]">
            <div className="relative aspect-[16/7] w-full sm:aspect-[1600/440]">
              {banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner} alt={se.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                  <span className={`${display} text-3xl uppercase tracking-wide text-white/80 sm:text-5xl`}>{se.title}</span>
                </div>
              )}
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,14,16,.72),transparent 42%)" }} />
            </div>
            <Link
              href="/library/series"
              className="absolute left-6 top-[4.75rem] text-xs font-semibold uppercase tracking-[0.25em] text-white/85 transition-colors hover:text-white lg:left-10 lg:top-[5.5rem] [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
            >
              &larr; All series
            </Link>
          </div>

          {/* hovering meta bar */}
          <div className="relative z-10 -mt-7 flex justify-center px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-white/10 bg-[#121a1e] px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-white/85 shadow-[0_16px_44px_rgba(0,0,0,.55)]">
              {fmtRange(se.startsOn, se.endsOn) && <span>{fmtRange(se.startsOn, se.endsOn)}</span>}
              {fmtRange(se.startsOn, se.endsOn) && <span aria-hidden className="text-white/25">·</span>}
              <span className="text-secondary-soft">{items.length} {items.length === 1 ? "message" : "messages"}</span>
            </div>
          </div>
        </section>

        <div className="px-6 pb-16 pt-8 lg:px-10">
          {se.description && (
            <p className="mx-auto mb-9 max-w-2xl text-center text-[1.02rem] leading-relaxed text-white/70">{se.description}</p>
          )}
          {items.length > 0 ? (
            <div className="mx-auto flex max-w-6xl flex-col gap-9">
              {(() => {
                let start = 0;
                return balancedRows(items.length).map((size, r) => {
                  const from = start;
                  const slice = items.slice(from, from + size);
                  start += size;
                  return (
                    <div key={r} className="flex flex-wrap justify-center gap-x-5 gap-y-9">
                      {slice.map((s, i) => (
                        <div key={s.slug} className="w-full sm:w-[calc((100%_-_1.25rem)/2)] lg:w-[calc((100%_-_3.75rem)/4)]">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-secondary-soft">Week {s.week ?? from + i + 1}</p>
                          <SermonCard sermon={s} hideSeries />
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <p className="text-white/55">Nothing published in this series yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

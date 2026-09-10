import type { CardSermon } from "@/lib/browse";
import { sermonPoster } from "@/lib/browse";
import { pathFor, type Category } from "@/lib/categories";
import FramedImage from "@/components/sermons/FramedImage";
import { DEFAULT_TARGET_X, DEFAULT_TARGET_Y, DEFAULT_ZOOM } from "@/lib/framing";
import { optimizedImg } from "@/lib/img";

const display = "font-[family-name:var(--font-display)]";

/*
  What a card needs. CardSermon is the slim serializable shape; the category
  is what decides the URL, so a card without one links as a sermon.
*/
export type CardPiece = CardSermon & { category?: Category };

// The fade blends into whatever sits behind the card: a section can set
// `--card-fade` to its own background; otherwise it falls back to the page ground.
const FADE = "var(--card-fade,#0a0e10)";
const mix = (pct: number) => `color-mix(in srgb, ${FADE} ${pct}%, transparent)`;

// Fine film grain (fractal noise), tiled — turns a flat frame into a portrait.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function fmt(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(d);
}

/*
  The "episode still" thumbnail. Every message uses the exact same system so the
  Messages page reads as one intentional set (series identity lives in the series
  artwork, not here). The speaker still is treated like a promotional portrait:
  focus-point framed (eyes toward the upper third, subject filling the frame), run
  through a consistent color grade (lifted contrast, warmed skin, desaturated stage,
  vignette, fine grain), with the title emerging from a soft bottom fade — no boxes.
  Monogram top-left; speaker below the title. No series art, no play button.
*/
export default function SermonCard({
  sermon,
  badge,
  hideSeries = false,
  className = "",
}: {
  sermon: CardPiece;
  badge?: string;
  hideSeries?: boolean;
  className?: string;
}) {
  const date = fmt(sermon.date);
  const still = optimizedImg(sermon.heroStillUrl ?? sermonPoster(sermon), 640);
  const seriesBg = optimizedImg(sermon.seriesBackgroundUrl, 640);
  const cutout = optimizedImg(sermon.heroCutoutUrl, 640);
  // When the series has a hero background, composite the speaker over it: use the
  // cut-out when we have one, otherwise feather the rectangular still into the bg.
  const composite = Boolean(seriesBg && (cutout || still));
  const speaker = composite && cutout ? cutout : still;
  const featherSpeaker = composite && !cutout;
  const fx = sermon.heroFocalX ?? 50;
  const fy = sermon.heroFocalY ?? 32;
  const tx = sermon.heroTargetX ?? DEFAULT_TARGET_X;
  const ty = sermon.heroTargetY ?? DEFAULT_TARGET_Y;
  const zoom = sermon.heroZoom ?? DEFAULT_ZOOM;
  const scripture = sermon.passage || sermon.scripture?.[0];
  const seriesName = hideSeries ? undefined : sermon.seriesTitle ?? sermon.series;

  return (
    <a href={pathFor(sermon)} className={`group block ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--card-fade,#0a0e10)]">
        {still ? (
          <>
            {/* series hero background, behind the speaker, graded to match */}
            {composite && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seriesBg}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full scale-110 object-cover"
                style={{ filter: "contrast(0.98) brightness(0.5) blur(3px)" }}
              />
            )}
            {/* speaker framed so the face lands on the chosen target at the chosen zoom */}
            <FramedImage
              src={speaker as string}
              focalX={fx}
              focalY={fy}
              targetX={tx}
              targetY={ty}
              zoom={zoom}
              className="absolute inset-0 h-full w-full transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              imgStyle={{
                filter: "contrast(1.14) brightness(0.95) saturate(0.9)",
                ...(featherSpeaker
                  ? {
                      WebkitMaskImage: `radial-gradient(74% 70% at ${fx}% ${fy}%, #000 42%, rgba(0,0,0,0.6) 64%, transparent 86%)`,
                      maskImage: `radial-gradient(74% 70% at ${fx}% ${fy}%, #000 42%, rgba(0,0,0,0.6) 64%, transparent 86%)`,
                    }
                  : {}),
              }}
            />
            {/* key light lifting the chosen face focal point */}
            <span aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(44% 40% at ${fx}% ${fy}%, rgba(255,205,160,0.14), transparent 62%)`, mixBlendMode: "soft-light" }} />
            {/* spotlight vignette centered on the face — surroundings recede, text reads */}
            <span aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(92% 86% at ${fx}% ${fy}%, transparent 22%, rgba(10,14,16,0.5) 55%, rgba(10,14,16,0.84) 100%)` }} />
            {/* film grain */}
            <span aria-hidden className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: GRAIN, backgroundSize: "140px", mixBlendMode: "overlay" }} />
            {/* top darken so the corner mark reads */}
            <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(180deg,${mix(45)} 0%,transparent 20%)` }} />
            {/* soft bottom fade into the page — typography emerges, no box */}
            <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(0deg,${FADE} 0%,${mix(86)} 14%,${mix(30)} 38%,transparent 62%)` }} />
          </>
        ) : (
          <>
            {/* branded placeholder when there's no still */}
            <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(140deg,#2c363a 0%,${FADE} 72%)` }} />
            <span aria-hidden className="absolute inset-0 grid place-items-center opacity-[0.12]">
              <span className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-white">AWD</span>
            </span>
            <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(0deg,${FADE} 0%,${mix(70)} 24%,transparent 60%)` }} />
          </>
        )}

        {/* Date, top-left (where the mark used to be) */}
        {date && (
          <p className="absolute left-3 top-3 z-10 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
            {date}
          </p>
        )}

        {/* soft-blue accent dash, always top-right */}
        {badge ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
            {badge}
          </span>
        ) : (
          <span aria-hidden className="absolute right-3 top-4 z-10 h-[3px] w-6 rounded-full bg-secondary" />
        )}

        {/* title bottom-left, accent rule, speaker, church — always the same place */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">
          <h3 className={`${display} line-clamp-3 text-[1.2rem] uppercase leading-[0.95] tracking-wide text-white sm:text-[1.4rem]`}>{sermon.title}</h3>
          <span aria-hidden className="mt-2.5 mb-2 block h-[3px] w-10 rounded-full bg-secondary transition-all duration-500 ease-out group-hover:w-14" />
          {sermon.speaker && <p className="text-[0.95rem] font-semibold leading-tight text-white sm:text-[1.05rem]">{sermon.speaker}</p>}
          {seriesName && <p className="mt-1.5 line-clamp-1 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-secondary-soft/75">{seriesName}</p>}
          {scripture && <p className="mt-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-secondary-soft">{scripture}</p>}
        </div>
      </div>
    </a>
  );
}

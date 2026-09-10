import type { Sermon } from "@/lib/sermons";
import { CATEGORIES, pathFor } from "@/lib/categories";
import { optimizedImg } from "@/lib/img";
import { display, fmtDate } from "./card";

/*
  The latest-piece billboard from the sermon library: a graded speaker still on
  the right, title on solid ground to the left, one call to action. The label
  and the button wording come from the piece's category.
*/
export default function Billboard({ piece, label }: { piece: Sermon; label?: string }) {
  const cat = CATEGORIES[piece.category] ?? CATEGORIES.sermon;
  const backdrop = optimizedImg(
    piece.heroStillUrl ?? piece.artworkUrl ?? piece.seriesArtworkUrl ??
      (piece.youtubeId ? `https://i.ytimg.com/vi/${piece.youtubeId}/maxresdefault.jpg` : undefined),
    1080,
  );
  const hasStill = Boolean(piece.heroStillUrl);
  const cta = piece.youtubeId ? `Watch the ${cat.noun}` : `Read the ${cat.noun}`;
  const date = fmtDate(piece.date);

  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-[58svh] items-end pt-24 lg:pt-28">
        {backdrop ? (
          <div className="absolute inset-0 overflow-hidden lg:left-[32%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdrop}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: `${piece.heroFocalX ?? 50}% ${piece.heroFocalY ?? 32}%`,
                filter: hasStill ? undefined : "grayscale(1) contrast(1.05) brightness(0.7)",
              }}
            />
            <span aria-hidden className="absolute inset-0 opacity-[0.16] mix-blend-soft-light" style={{ background: "#4F6B84" }} />
            <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 96% at 55% 30%, transparent 34%, rgba(10,14,16,0.66) 100%)" }} />
          </div>
        ) : (
          <div className="absolute inset-0 bg-primary-deep" />
        )}
        {/* desktop: hard left-to-black behind the words */}
        <span aria-hidden className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(90deg,#0a0e10 0%,#0a0e10 26%,rgba(10,14,16,.82) 48%,rgba(10,14,16,.3) 70%,transparent 90%)" }} />
        <span aria-hidden className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(0deg,#0a0e10 0%,transparent 48%)" }} />
        {/* mobile: bottom-up */}
        <span aria-hidden className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(0deg,#0a0e10 0%,#0a0e10 18%,rgba(10,14,16,.66) 48%,rgba(10,14,16,.12) 78%,transparent 100%)" }} />
        <div className="relative w-full px-6 pb-16 lg:px-10 lg:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary-soft/30 bg-secondary-soft/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-secondary-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-soft" /> {label ?? `Latest ${cat.noun}`}
          </span>
          {(piece.seriesTitle ?? piece.series) && (
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/70">{piece.seriesTitle ?? piece.series}</p>
          )}
          <h2 className={`${display} mt-1 max-w-3xl text-balance text-[clamp(2.25rem,5vw,4.75rem)] uppercase leading-[0.94] tracking-tight text-white`}>
            {piece.title}
          </h2>
          {piece.summary && <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/80">{piece.summary}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur">{cat.label}</span>
            {piece.passage && <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur">{piece.passage}</span>}
            {piece.speaker && <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur">{piece.speaker}</span>}
            {date && <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur">{date}</span>}
          </div>
          <a
            href={pathFor(piece)}
            className="group/cta mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink shadow-lg transition-transform duration-200 hover:scale-[1.03]"
          >
            {cta}
            <span aria-hidden className="transition-transform duration-200 group-hover/cta:translate-x-0.5">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}

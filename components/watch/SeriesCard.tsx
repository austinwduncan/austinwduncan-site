import type { Series } from "@/lib/series";
import { seriesPoster } from "@/lib/browse";
import { optimizedImg } from "@/lib/img";

/* A series (season) poster-card with its artwork + episode count over the image. */
export default function SeriesCard({ series, count, badge, href, className = "" }: { series: Series; count: number; badge?: string; href?: string; className?: string }) {
  const poster = optimizedImg(seriesPoster(series), 640);
  return (
    <a href={href ?? `/series/${series.slug}`} className={`group block ${className}`}>
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e191d] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-white/25">
        <div className="relative aspect-[16/10] bg-primary-deep">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-3 text-center font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-white/70">
              {series.title}
            </span>
          )}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
              {badge}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary-soft [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
              {count} {count === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>
      </article>
    </a>
  );
}

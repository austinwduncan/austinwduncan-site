import type { Sermon } from "@/lib/sermons";

/*
  A piece's picture, or a typographic tile when it has none.

  A raw YouTube frame is never used as a fallback here: livestream thumbnails
  are whatever was on screen at that second (announcements, a song, someone
  else on stage), which is the wrong first impression. Real artwork or a still
  chosen in the builder shows; otherwise the title is set on black.
*/
export function artFor(s: Pick<Sermon, "heroStillUrl" | "artworkUrl" | "seriesArtworkUrl">): string | undefined {
  return s.artworkUrl ?? s.heroStillUrl ?? s.seriesArtworkUrl ?? undefined;
}

export function Poster({
  piece,
  className = "",
  size = "sm",
  lazy = true,
}: {
  piece: Pick<Sermon, "title" | "passage" | "heroStillUrl" | "artworkUrl" | "seriesArtworkUrl">;
  className?: string;
  size?: "sm" | "lg";
  lazy?: boolean;
}) {
  const src = artFor(piece);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading={lazy ? "lazy" : undefined} className={`aspect-video w-full object-cover ${className}`} style={{ background: "#E4E4E7" }} />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex aspect-video w-full flex-col justify-end overflow-hidden ${size === "lg" ? "p-[6%]" : "p-[8%]"} ${className}`}
      style={{ background: "#171918", color: "#FFFFFF", fontFamily: "var(--font-cmg), system-ui, sans-serif" }}
    >
      <span
        className="line-clamp-3 text-balance"
        style={{
          fontWeight: 800,
          fontSize: size === "lg" ? "clamp(1.6rem, 4.2vw, 3.8rem)" : "clamp(0.62rem, 1.05vw, 0.95rem)",
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
        }}
      >
        {piece.title}
      </span>
      {piece.passage && size === "lg" && (
        <span className="mt-[4%] font-semibold" style={{ color: "#CDB079", fontSize: "clamp(0.8rem, 1.3vw, 1.2rem)" }}>
          {piece.passage}
        </span>
      )}
      <span className="mt-[5%] block h-[3px] w-[18%]" style={{ background: "#CDB079" }} />
    </span>
  );
}

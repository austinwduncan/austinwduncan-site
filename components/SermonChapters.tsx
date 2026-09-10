"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime, isFollowing, subscribeTime } from "@/lib/sermonPlayer";

/*
  Cinematic chapter filmstrip beneath the video. Sermon headings that carry a
  timestamp become "frames": each shows a still from the video with its timecode
  and title. Click a frame to seek there; the active frame lights up and scrubs
  itself into view as the video plays. Rendered only when >=2 chapters are timed.
*/
export default function SermonChapters({
  sections,
  youtubeId,
}: {
  sections: { id: string; text: string; t?: number }[];
  youtubeId?: string;
}) {
  const chapters = sections.filter((s) => s.t != null) as {
    id: string;
    text: string;
    t: number;
  }[];
  const [active, setActive] = useState<string>(chapters[0]?.id ?? "");
  const strip = useRef<HTMLDivElement>(null);
  const cells = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (chapters.length === 0) return;
    return subscribeTime((t) => {
      if (!isFollowing()) return;
      let current = chapters[0].id;
      for (const c of chapters) {
        if (c.t <= t + 0.25) current = c.id;
        else break;
      }
      setActive(current);
    });
  }, [chapters]);

  // Scrub the active frame into view within the strip as playback advances.
  useEffect(() => {
    const el = cells.current[active];
    if (el && isFollowing()) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  if (chapters.length < 2) return null;

  const thumb = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg` : null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.3em] text-secondary-soft">
          Chapters
        </p>
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[0.7rem] uppercase tracking-wide text-white/40">
          {chapters.length} scenes
        </span>
      </div>

      <div
        ref={strip}
        className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-3 lg:mx-0 lg:px-0 [scrollbar-width:thin]"
      >
        {chapters.map((c, i) => {
          const on = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              ref={(el) => {
                cells.current[c.id] = el;
              }}
              onClick={() => window.dispatchEvent(new CustomEvent("cw:play", { detail: { t: c.t } }))}
              aria-current={on ? "true" : undefined}
              className={`group relative aspect-video w-44 shrink-0 snap-start overflow-hidden rounded-lg text-left ring-1 transition-all duration-300 sm:w-52 ${
                on
                  ? "scale-[1.02] ring-2 ring-secondary"
                  : "opacity-70 ring-white/10 hover:opacity-100 hover:ring-white/30"
              }`}
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 bg-primary" />
              )}
              <span
                aria-hidden
                className={`absolute inset-0 transition-colors ${
                  on ? "bg-primary-deep/45" : "bg-primary-deep/65 group-hover:bg-primary-deep/50"
                }`}
              />
              {/* timecode */}
              <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[0.7rem] font-semibold tabular-nums text-white backdrop-blur-sm">
                {formatTime(c.t)}
              </span>
              {/* play glyph on the active frame */}
              {on && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-primary-deep">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-3 w-3 fill-current" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                </span>
              )}
              {/* number + title */}
              <span className="absolute inset-x-0 bottom-0 p-2.5">
                <span className="block text-[0.65rem] uppercase tracking-wide text-white/55">
                  Scene {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-white">
                  {c.text}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

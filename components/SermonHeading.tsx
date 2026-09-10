"use client";

import { formatTime, seekTo } from "@/lib/sermonPlayer";

/*
  A section heading with an optional "play from here" button that seeks the
  video to this section's timestamp. Only shown when the sermon has a video and
  the section carries a time.
*/
const display = "font-[family-name:var(--font-display)]";

export default function SermonHeading({
  id,
  text,
  t,
  hasVideo,
}: {
  id: string;
  text: string;
  t?: number;
  hasVideo: boolean;
}) {
  return (
    <h2
      id={id}
      className={`${display} scroll-mt-28 mt-12 mb-4 text-2xl tracking-wide text-ink sm:text-3xl`}
    >
      {text}
      {hasVideo && t != null && (
        <button
          type="button"
          onClick={() => seekTo(t)}
          aria-label={`Play the video from ${text}`}
          className="ml-3 inline-flex translate-y-[-2px] items-center gap-1 rounded-full border border-ink/15 px-2.5 py-0.5 align-middle text-[0.7rem] font-semibold tracking-wide text-accent transition-colors hover:border-secondary/50 hover:text-ink"
        >
          <span aria-hidden>▶</span> {formatTime(t)}
        </button>
      )}
    </h2>
  );
}

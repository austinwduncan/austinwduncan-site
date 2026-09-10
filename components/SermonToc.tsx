"use client";

import { useEffect, useState } from "react";
import { isFollowing, seekTo, subscribeTime } from "@/lib/sermonPlayer";

/*
  Sticky table of contents for a sermon article. It tracks the current section
  two ways and shows whichever is fresher:
    - while the video plays, it follows the video's time (the section whose
      timestamp the video has most recently passed)
    - otherwise it follows scroll position via an IntersectionObserver
  Clicking a section with a timestamp also seeks the video there.
*/
export default function SermonToc({
  sections,
}: {
  sections: { id: string; text: string; t?: number }[];
}) {
  const [scrollActive, setScrollActive] = useState<string>(sections[0]?.id ?? "");
  const [videoActive, setVideoActive] = useState<string>("");
  const [followingVideo, setFollowingVideo] = useState(false);

  // scroll-based active section
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onscreen[0]) setScrollActive(onscreen[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // video-time-based active section
  useEffect(() => {
    const timed = sections.filter((s) => s.t != null);
    if (timed.length === 0) return;
    return subscribeTime((t) => {
      let current = timed[0].id;
      for (const s of timed) {
        if ((s.t as number) <= t + 0.25) current = s.id;
        else break;
      }
      setVideoActive(current);
      setFollowingVideo(isFollowing());
    });
  }, [sections]);

  const active = followingVideo && isFollowing() && videoActive ? videoActive : scrollActive;

  return (
    <nav aria-label="On this page">
      <p className="mb-4 font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.25em] text-accent">
        On this page
      </p>
      <ul className="space-y-1 border-l border-ink/10">
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                onClick={() => {
                  // Only nudge the video if it's actually playing; otherwise this
                  // is just a jump to read that section (no surprise audio).
                  if (s.t != null && isFollowing()) seekTo(s.t);
                }}
                className={`-ml-px block border-l-2 py-1 pl-4 text-sm leading-snug transition-colors ${
                  on
                    ? "border-secondary font-medium text-ink"
                    : "border-transparent text-ink/70 hover:border-ink/30 hover:text-ink"
                }`}
              >
                {s.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

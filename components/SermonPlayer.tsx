"use client";

import { useEffect, useRef, useState } from "react";
import { reportState, reportTime, setPlayer, subscribeTime } from "@/lib/sermonPlayer";

/*
  The sermon "stage": the video is the centerpiece of the page, so this does more
  than drop in an iframe.

  - Embeds through the YouTube IFrame API (not a plain iframe) so the article and
    the chapter rail can drive it: jump buttons seek, the TOC/chapters follow along.
  - Ambient glow: a blurred, scaled copy of the artwork bleeds behind the frame
    (YouTube "ambient mode") so the player feels lit, not pasted onto black.
  - Custom poster: before the first play we show our own artwork with a large play
    button instead of YouTube's raw thumbnail, then reveal the real player.

  Registers with the shared controller in sermonPlayer.ts.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function SermonPlayer({
  youtubeId,
  title,
  start,
  poster,
  bare = false,
}: {
  youtubeId: string;
  title: string;
  /** Seconds into the video where the sermon begins (full-service recordings). */
  start?: number;
  /** Artwork shown behind and over the player before playback begins. */
  poster?: string;
  /** Skip the ambient glow + poster overlay (the parent supplies the backdrop
      and controls play, e.g. the hero). Renders just the video frame. */
  bare?: boolean;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);

  // If the poster fails to load (e.g. a missing maxres thumbnail), fall back to
  // YouTube's hqdefault, which always exists.
  const onPosterError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const fallback = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    if (img.src !== fallback) img.src = fallback;
  };

  useEffect(() => {
    let poll: ReturnType<typeof setInterval> | undefined;
    let yt: any;

    function create() {
      if (!holder.current || !window.YT?.Player) return;
      yt = new window.YT.Player(holder.current, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0, // no native play/pause chrome; we drive play/pause ourselves
          disablekb: 1,
          ...(start && start > 0 ? { start: Math.floor(start) } : {}),
        },
        events: {
          onReady: () => {
            playerRef.current = yt;
            setPlayer(yt);
            setReady(true);
          },
          onStateChange: (e: any) => {
            reportState(e.data);
            if (poll) clearInterval(poll);
            if (e.data === 1 /* playing */) {
              setStarted(true);
              poll = setInterval(() => {
                try {
                  reportTime(yt.getCurrentTime());
                } catch {
                  /* ignore */
                }
              }, 500);
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      create();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        create();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(s);
      }
    }

    return () => {
      if (poll) clearInterval(poll);
      try {
        yt?.destroy?.();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      setPlayer(null);
    };
  }, [youtubeId, start]);

  // In case playback is started elsewhere (a chapter/TOC seek), drop the poster.
  useEffect(() => subscribeTime(() => setStarted(true)), []);

  function play() {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (start && start > 0) p.seekTo(Math.floor(start), true);
      p.playVideo?.();
      setStarted(true);
    } catch {
      /* ignore */
    }
  }

  if (bare) {
    return (
      <div className="h-full w-full overflow-hidden bg-black">
        <div ref={holder} className="h-full w-full" aria-label={title} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* ambient glow */}
      {poster && (
        <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            onError={onPosterError}
            className="h-full w-full scale-125 object-cover opacity-40 blur-3xl saturate-150"
          />
        </div>
      )}

      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <div ref={holder} className="h-full w-full" aria-label={title} />

        {/* custom poster overlay until the first play */}
        {poster && !started && (
          <button
            type="button"
            onClick={play}
            disabled={!ready}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 flex items-center justify-center focus:outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" onError={onPosterError} className="absolute inset-0 h-full w-full object-cover" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary-deep shadow-xl transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110">
              {ready ? (
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-deep/30 border-t-primary-deep" />
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

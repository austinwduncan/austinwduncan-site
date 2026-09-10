"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SermonPlayer from "./SermonPlayer";
import { hasPlayer, pauseVideo, playVideo, seekTo, subscribeState } from "@/lib/sermonPlayer";
import { focalPosition } from "@/lib/focal";

/*
  The sermon hero, Apple-TV / streaming style. It starts as a still from the video
  with the title bleeding out of a hard left-to-black fade, plus a "Watch message"
  button and a big play button over the frame. On play the still + title fade away
  and the video fills the whole hero; a hint invites scrolling down to the written
  message. Chapters elsewhere fire a `cw:play` event to jump the video here.
*/

const display = "font-[family-name:var(--font-display)]";

export default function SermonHero({
  seriesLabel,
  title,
  lede,
  speaker,
  dateLabel,
  date,
  passage,
  mins,
  youtubeId,
  start,
  backdrop,
  heroStill,
  heroCutout,
  heroFocalX = 50,
  heroFocalY = 35,
  seriesBackground,
  hasArticle,
  hasChapters,
  backHref = "/sermons",
  backLabel = "All sermons",
  watchLabel = "Watch message",
}: {
  seriesLabel?: string;
  title: string;
  lede?: string;
  speaker: string;
  dateLabel?: string | null;
  date?: string;
  passage?: string;
  mins: number;
  youtubeId?: string;
  start?: number;
  backdrop?: string;
  /** Uploaded speaker still (the hero photo); falls back to series background. */
  heroStill?: string;
  /** Background-removed speaker cut-out; composited cleanly over the series bg. */
  heroCutout?: string;
  /** Focus point (% of the photo) so the speaker frames consistently. */
  heroFocalX?: number;
  heroFocalY?: number;
  seriesBackground?: string;
  hasArticle: boolean;
  hasChapters: boolean;
  /** Where the back link goes (the piece's category page) and what it says. */
  backHref?: string;
  backLabel?: string;
  /** Label on the primary play button. */
  watchLabel?: string;
}) {
  const [playing, setPlaying] = useState(false);
  // The YouTube iframe machinery (~1MB) mounts off the critical path: on first
  // user interaction or a short timer, so it never competes with the hero's
  // first paint but is ready before a human reaches the play button.
  const [mountPlayer, setMountPlayer] = useState(false);
  useEffect(() => {
    const arm = () => setMountPlayer(true);
    const t = setTimeout(arm, 3000);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", arm, opts);
    window.addEventListener("scroll", arm, opts);
    window.addEventListener("keydown", arm, opts);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);
  const [started, setStarted] = useState(false);
  const [hint, setHint] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startedRef = useRef(false);

  // Measure the fixed site header so the playing video can sit flush beneath it.
  const measureHeader = useCallback(() => {
    const el = document.querySelector("header");
    setHeaderH(el ? Math.round(el.getBoundingClientRect().height) : 96);
  }, []);
  useEffect(() => {
    // measureHeader() runs on play() (an event handler); here we only keep it
    // fresh on resize. headerH is unused until the video is playing.
    window.addEventListener("resize", measureHeader);
    return () => window.removeEventListener("resize", measureHeader);
  }, [measureHeader]);

  // Run `fn` once the YouTube player is ready (a click can beat onReady).
  function whenReady(fn: () => void) {
    if (hasPlayer()) return fn();
    let n = 0;
    const id = setInterval(() => {
      if (hasPlayer()) {
        fn();
        clearInterval(id);
      } else if (++n > 30) {
        clearInterval(id);
      }
    }, 120);
  }

  const play = useCallback(
    (t?: number) => {
      if (!youtubeId) return;
      setMountPlayer(true); // clicks that beat the deferred mount queue via whenReady
      // Collapse the cinematic hero and bring the video up under the header,
      // article right below it.
      measureHeader();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setPlaying(true);
      if (t != null) {
        whenReady(() => seekTo(t));
      } else if (!startedRef.current) {
        whenReady(() => seekTo(start && start > 0 ? start : 0));
      } else {
        whenReady(() => playVideo()); // resume from the paused frame
      }
      if (hasArticle) {
        setHint(true);
        if (hintTimer.current) clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setHint(false), 6000);
      }
    },
    [youtubeId, start, hasArticle, measureHeader],
  );

  // Chapters / other controls ask the hero to jump to a moment (play() scrolls up).
  useEffect(() => {
    const onPlay = (e: Event) => {
      const t = (e as CustomEvent).detail?.t as number | undefined;
      play(t);
    };
    window.addEventListener("cw:play", onPlay);
    return () => window.removeEventListener("cw:play", onPlay);
  }, [play]);

  // Drive the treatment off the real player state: on pause/end, the fade sweeps
  // back and the title returns over the frame it's paused on (the video stays put).
  useEffect(
    () =>
      subscribeState((st) => {
        if (st === 1 /* playing */) {
          setStarted(true);
          startedRef.current = true;
          setPlaying(true);
        } else if (st === 2 /* paused */ || st === 0 /* ended */) {
          setPlaying(false);
        }
      }),
    [],
  );

  // Dismiss the scroll hint once they actually scroll.
  useEffect(() => {
    if (!hint) return;
    const onScroll = () => setHint(false);
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hint]);

  const onBackdropError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!youtubeId) return;
    const img = e.currentTarget;
    const fb = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    if (img.src !== fb) img.src = fb;
  };

  // The play button exists only when there is a video to play.
  const canWatch = Boolean(youtubeId);
  // A real uploaded speaker image (cut-out preferred). The series background sits
  // behind it when both exist; with no speaker photo the background stands in, and
  // with neither we fall back to the video thumbnail.
  const speakerPhoto = heroCutout || heroStill;
  const bg = seriesBackground;
  const composite = Boolean(bg && speakerPhoto); // background behind a distinct speaker
  const featherSpeaker = composite && !heroCutout; // rectangular still -> feather into bg
  const still = speakerPhoto || bg || backdrop;
  // With a series background behind the speaker, lighten the title scrims so the
  // branded backdrop shows through (still dark enough to read the white title).
  const leftFade = composite
    ? "linear-gradient(90deg,rgba(7,9,12,.92) 0%,rgba(7,9,12,.8) 32%,rgba(7,9,12,.5) 56%,rgba(7,9,12,.18) 80%,transparent 94%)"
    : "linear-gradient(90deg,#07090c 0%,#07090c 26%,rgba(7,9,12,.8) 48%,rgba(7,9,12,.3) 70%,transparent 88%)";
  const mobileFade = composite
    ? "linear-gradient(0deg,rgba(7,9,12,.95) 0%,rgba(7,9,12,.8) 26%,rgba(7,9,12,.4) 54%,rgba(7,9,12,.12) 80%,transparent 100%)"
    : "linear-gradient(0deg,#07090c 0%,#07090c 20%,rgba(7,9,12,.68) 48%,rgba(7,9,12,.15) 76%,transparent 100%)";

  // Position the still so the focus point (the speaker's face) is centered in its
  // region — the right region on desktop, the full frame (so, centered) on mobile.
  const stillWrapRef = useRef<HTMLDivElement | null>(null);
  const stillImgRef = useRef<HTMLImageElement | null>(null);
  const [stillPos, setStillPos] = useState<{ x: number; y: number } | null>(null);
  const layoutStill = useCallback(() => {
    const wrap = stillWrapRef.current;
    const img = stillImgRef.current;
    if (!wrap || !img || !img.naturalWidth) return;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    setStillPos(
      focalPosition(wrap.clientWidth, wrap.clientHeight, img.naturalWidth, img.naturalHeight, heroFocalX, heroFocalY, desktop ? 0.6 : 0.5, 0.4),
    );
  }, [heroFocalX, heroFocalY]);
  useEffect(() => {
    window.addEventListener("resize", layoutStill);
    return () => window.removeEventListener("resize", layoutStill);
  }, [layoutStill]);

  return (
    <section
      ref={heroRef}
      // Desktop is pinned to 100svh (lg:! beats the inline height) so nothing
      // resizes vertically there. Mobile smoothly collapses to a 16:9 video below
      // the header on play, and eases back open on pause.
      className="relative overflow-hidden bg-[#07090c] text-white lg:!h-[100svh]"
      style={{
        height: playing ? `calc(${headerH}px + 56.25vw)` : "100svh",
        transition: "height 620ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* fine monochrome film grain for the graded still */}
      <svg aria-hidden width="0" height="0" className="absolute" style={{ position: "absolute" }}>
        <filter id="cw-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* video layer. On mobile its top eases below the header on play; on desktop
          it's pinned full. The inner box covers the hero (like the poster) when
          not playing, and is an exact fit when playing so the whole frame shows. */}
      {youtubeId && mountPlayer && (
        <div
          className={`absolute inset-x-0 bottom-0 z-0 overflow-hidden bg-black lg:!top-0 ${
            playing ? "" : "grayscale contrast-125"
          }`}
          style={{
            top: playing ? headerH : 0,
            transition: "top 620ms cubic-bezier(0.22,1,0.36,1), filter 500ms ease",
          }}
        >
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
              playing
                ? "h-full w-full"
                : "h-[max(100svh,56.25vw)] w-[max(100vw,calc(100svh*16/9))] lg:h-full lg:w-full"
            }`}
          >
            <SermonPlayer youtubeId={youtubeId} title={title} start={start} bare />
          </div>
        </div>
      )}

      {/* graded hero image + cinematic fades. Fades out on play and fades back in
          on pause (returning to the hero image, over the paused video). */}
      <div
        aria-hidden
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${
          playing ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {/* The graded hero image shows whenever we're not playing — both before the
            first play and whenever the video is paused (it fades in over the video). */}
        {/* series hero background, full-bleed behind the speaker, graded to match */}
        {composite && (
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bg} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" style={{ filter: "grayscale(1) contrast(1.0) brightness(0.5) blur(2px)" }} />
            <span className="absolute inset-0 opacity-[0.18] mix-blend-soft-light" style={{ background: "#4F6B84" }} />
          </div>
        )}
        {still ? (
            // Leadership-style grade: a punchy grayscale speaker photo with brand-teal
            // depth, a soft key light and fine grain. The photo fills the right region
            // on desktop (so the speaker sits in the clear part of the left fade) and
            // the full frame on mobile; the focus point keeps the speaker framed in it.
            <div ref={stillWrapRef} className="absolute inset-0 overflow-hidden lg:left-[32%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={stillImgRef}
                src={still}
                alt=""
                aria-hidden
                onLoad={layoutStill}
                onError={onBackdropError}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: stillPos ? `${stillPos.x}% ${stillPos.y}%` : "50% 38%",
                  filter: "grayscale(1) contrast(1.45) brightness(1.12)",
                  ...(featherSpeaker
                    ? {
                        WebkitMaskImage: "radial-gradient(78% 74% at 54% 40%, #000 46%, rgba(0,0,0,0.55) 68%, transparent 88%)",
                        maskImage: "radial-gradient(78% 74% at 54% 40%, #000 46%, rgba(0,0,0,0.55) 68%, transparent 88%)",
                      }
                    : {}),
                }}
              />
              {/* brand-teal depth — kept light so it doesn't gray the highlights */}
              <span aria-hidden className="absolute inset-0 opacity-[0.18] mix-blend-soft-light" style={{ background: "#4F6B84" }} />
              {/* soft key light, over the speaker, so the flat still gains dimension */}
              <span aria-hidden className="absolute inset-0 mix-blend-screen" style={{ background: "radial-gradient(70% 60% at 52% 26%, rgba(157,180,200,0.2), transparent 60%)" }} />
              {/* brighten the speaker so his whites read white against the background */}
              <span aria-hidden className="absolute inset-0 mix-blend-screen" style={{ background: "radial-gradient(56% 50% at 52% 36%, rgba(255,255,255,0.28), transparent 60%)" }} />
              {/* vignette — background recedes around the lit speaker */}
              <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 96% at 52% 30%, transparent 32%, rgba(7,9,12,0.7) 100%)" }} />
              {/* ground the bottom of the photo (hides the lower edge) */}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(0deg,#07090c 0%,transparent 100%)" }} />
              {/* a little film grain */}
              <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.1] mix-blend-overlay">
                <rect width="100%" height="100%" filter="url(#cw-grain)" />
              </svg>
            </div>
          ) : (
            <div className="h-full w-full bg-primary-deep" />
          )}
        {/* desktop: fade to black across the left, where the title lives (the image
            is shifted right so the speaker sits in the clear part of this fade) */}
        <span className="absolute inset-0 hidden lg:block" style={{ background: leftFade }} />
        <span className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(0deg,#07090c 0%,transparent 45%)" }} />
        {/* mobile: fade to black from the bottom up, under the stacked title */}
        <span className="absolute inset-0 lg:hidden" style={{ background: mobileFade }} />
        {/* corner bracket accent (matches the leader page) */}
        {still && (
          <span className="absolute right-5 top-24 h-9 w-9 border-r border-t border-white/40 lg:top-28" />
        )}
      </div>

      {/* click anywhere on the playing video to pause (native controls are off) */}
      {youtubeId && playing && (
        <button
          type="button"
          aria-label="Pause"
          onClick={() => pauseVideo()}
          className="absolute inset-0 z-[15] cursor-pointer"
        />
      )}

      {/* back link */}
      <a
        href={backHref}
        className={`absolute left-6 top-24 z-20 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-all hover:text-white lg:left-[clamp(1.5rem,5vw,4.75rem)] lg:top-28 ${
          playing ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        &larr; {backLabel}
      </a>

      {/* title + actions — anchored to the bottom of the cinematic hero; fades out
          on play, animates back in on pause */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-6 pb-16 transition-all duration-500 ease-out lg:px-[clamp(1.5rem,5vw,4.75rem)] lg:pb-20 ${
          playing ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="max-w-[54rem]">
          {seriesLabel && (
            <p className={`${display} mb-3 text-sm uppercase tracking-[0.28em] text-secondary-soft`}>{seriesLabel}</p>
          )}
          <h1 className={`${display} text-balance text-[clamp(2.25rem,5.2vw,5.25rem)] uppercase leading-[0.92] tracking-tight text-white drop-shadow-[0_8px_36px_rgba(0,0,0,0.35)]`}>
            {title}
          </h1>
          {lede && (
            <p className="mt-6 max-w-[38rem] text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed text-white/80 line-clamp-4">{lede}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              {speaker}
            </span>
            {dateLabel && (
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
                <time dateTime={date}>{dateLabel}</time>
              </span>
            )}
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              {mins} min read
            </span>
            {passage && (
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></svg>
                {passage}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {canWatch && (
              <button
                type="button"
                onClick={() => play()}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink shadow-lg transition-transform duration-200 hover:scale-[1.03]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                {watchLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("cw:notes"))}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              <span aria-hidden className="text-base leading-none">＋</span> Notes
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("cw:share"))}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              <span aria-hidden>↗</span> Share
            </button>
            {hasChapters && (
              <button
                type="button"
                onClick={() => document.getElementById("chapters")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                <span aria-hidden>↓</span> Chapters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* vertical scroll cue, only before the first play */}
      {hasArticle && !started && (
        <div className="pointer-events-none absolute bottom-16 right-[clamp(1.5rem,5vw,4.75rem)] z-20 hidden items-center gap-3 text-[0.7rem] uppercase tracking-[0.2em] text-secondary-soft lg:flex [writing-mode:vertical-rl]">
          Scroll to explore
          <span aria-hidden className="h-14 w-px bg-secondary-soft/70" />
        </div>
      )}

      {/* scroll hint while watching */}
      {hasArticle && (
        <a
          href="#read"
          className={`absolute inset-x-0 bottom-6 z-30 mx-auto flex w-max items-center gap-2 rounded-full bg-black/55 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur transition-all duration-500 ${
            hint ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          Keep scrolling for the message
          <span aria-hidden className="animate-bounce">↓</span>
        </a>
      )}
    </section>
  );
}

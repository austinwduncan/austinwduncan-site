"use client";

import { useEffect, useState } from "react";

type LiveStatus = { live: true; videoId: string } | { live: false };

const display = "font-[family-name:var(--font-display)]";

/*
  Wraps the normal Messages hero. While the channel is off the air it simply
  renders `children` (the featured-message hero). The moment YouTube reports the
  stream is live, the hero is replaced by a cinematic "We're live" panel; tapping
  "Join us live" swaps in the stream and it plays right there in the header.

  Live status comes from /api/live (server-side YouTube read, cached ~60s) and is
  polled about once a minute, so the page itself stays static and fast.
*/
export default function LiveGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LiveStatus>({ live: false });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const r = await fetch("/api/live", { cache: "no-store" });
        if (!r.ok) return;
        const data = (await r.json()) as LiveStatus;
        if (alive) setStatus(data);
      } catch {
        /* offline / blocked — keep showing the normal hero */
      }
    };
    check();
    const t = setInterval(check, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!status.live) return <>{children}</>;

  const backdrop = `https://i.ytimg.com/vi/${status.videoId}/maxresdefault.jpg`;

  return (
    <section className="relative overflow-hidden">
      {playing ? (
        <div className="relative w-full bg-black pt-16 lg:pt-[4.5rem]">
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${status.videoId}?autoplay=1&rel=0`}
              title="Austin W. Duncan live"
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-[58svh] items-end pt-24 lg:pt-28">
          {/* live still as a dim backdrop */}
          <div className="absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 40%" }} />
            <span aria-hidden className="absolute inset-0 opacity-[0.16] mix-blend-soft-light" style={{ background: "#4F6B84" }} />
            <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 96% at 55% 30%, transparent 30%, rgba(10,14,16,0.72) 100%)" }} />
          </div>
          <span aria-hidden className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(90deg,#0a0e10 0%,#0a0e10 22%,rgba(10,14,16,.8) 46%,rgba(10,14,16,.3) 70%,transparent 92%)" }} />
          <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(0deg,#0a0e10 0%,rgba(10,14,16,.2) 42%,transparent 70%)" }} />

          <div className="relative w-full px-6 pb-16 lg:px-10 lg:pb-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Live now
            </span>
            <h1 className={`${display} mt-4 max-w-3xl text-balance text-[clamp(2.25rem,5vw,4.75rem)] uppercase leading-[0.94] tracking-tight text-white`}>
              We&rsquo;re live
            </h1>
            <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/80">
              The service is streaming right now. Join us and worship together, wherever you are.
            </p>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group/cta mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink shadow-lg transition-transform duration-200 hover:scale-[1.03]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M8 5v14l11-7z" /></svg>
              Join us live
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

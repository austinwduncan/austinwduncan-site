"use client";

import { useState } from "react";
import { parseYouTubeId } from "@/lib/youtubeId";

/*
  Quick hero-still picker. Shows a few frames YouTube exposes for the service
  video — the poster plus storyboard frames at roughly 1/4, 1/2, 3/4 — so the
  pastor can grab one in a click instead of scrubbing and screenshotting. The
  picked frame is fetched + stored server-side, then feeds the focal-point tool.
*/
export default function HeroFramePicker({
  youtubeId,
  onPick,
}: {
  youtubeId: string;
  onPick: (url: string) => void;
}) {
  const id = parseYouTubeId(youtubeId);
  const [busy, setBusy] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!id) return null;

  const frames = [
    { key: "maxresdefault", label: "Poster" },
    { key: "hq1", label: "~¼ in" },
    { key: "hq2", label: "Midpoint" },
    { key: "hq3", label: "~¾ in" },
  ];
  const src = (k: string) => `https://i.ytimg.com/vi/${id}/${k}.jpg`;

  async function grab(k: string) {
    setBusy(k);
    setErr(null);
    try {
      const r = await fetch("/api/sermons/hero-frame", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: src(k) }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.url) {
        onPick(d.url);
        setPicked(k);
      } else {
        setErr("Couldn't grab that frame — try another, or upload one below.");
      }
    } catch {
      setErr("Couldn't grab that frame.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-3 rounded-xl border border-ink/10 bg-ink/[0.02] p-3">
      <p className="text-xs font-semibold text-ink/70">Grab a still from the video</p>
      <p className="mt-0.5 text-[0.7rem] text-ink/45">
        Pick a frame with the pastor in view — fine-tune the crop below after. For a sharper hero, you can
        still upload a full-res screenshot instead.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {frames.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => grab(f.key)}
            disabled={!!busy}
            className={`group relative overflow-hidden rounded-lg border transition disabled:opacity-60 ${
              picked === f.key ? "border-secondary ring-2 ring-secondary" : "border-ink/15 hover:border-ink/40"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(f.key)}
              alt=""
              className="aspect-video w-full object-cover"
              onError={(e) => {
                const b = e.currentTarget.closest("button");
                if (b) (b as HTMLElement).style.display = "none";
              }}
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[0.62rem] font-semibold uppercase tracking-wide text-white">
              {busy === f.key ? "Grabbing…" : picked === f.key ? "✓ Picked" : f.label}
            </span>
          </button>
        ))}
      </div>
      {err && <p className="mt-1 text-[0.7rem] font-semibold text-accent">{err}</p>}
    </div>
  );
}

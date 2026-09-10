"use client";

import { useState } from "react";

/*
  Background-removal control for the hero still. Sends the picked frame to the
  gated /api/sermons/cutout endpoint, which returns a transparent speaker
  cut-out. The cut-out then composites over the series background on the hero
  and the thumbnail cards. Focal point (set on the still) still applies.
*/
export default function CutoutButton({
  stillUrl,
  cutoutUrl,
  seriesBg,
  onCutout,
}: {
  stillUrl: string;
  cutoutUrl: string;
  seriesBg?: string;
  onCutout: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/sermons/cutout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: stillUrl }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.url) onCutout(d.url);
      else setErr("Couldn't remove the background. Try a cleaner frame.");
    } catch {
      setErr("Removal failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy || !stillUrl}
          className="rounded-full border border-ink/20 bg-ink/[0.03] px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/[0.06] disabled:opacity-50"
        >
          {busy ? "Removing background…" : cutoutUrl ? "Redo background removal" : "Remove background"}
        </button>
        {cutoutUrl && !busy && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-secondary">
            ✓ Background removed
            <button
              type="button"
              onClick={() => onCutout("")}
              className="font-medium text-ink/40 underline hover:text-ink/70"
            >
              clear
            </button>
          </span>
        )}
      </div>
      <p className="mt-1 text-[0.7rem] text-ink/45">
        Places the speaker over the series background on the hero and thumbnails. Takes a few seconds. For a clean cut,
        pick a frame where the screen behind isn&rsquo;t showing a camera view of the speaker.
      </p>
      {cutoutUrl && !busy && (
        <div className="mt-2">
          <p className="mb-1 text-[0.7rem] font-medium text-ink/60">Preview over the series background</p>
          <div className="relative aspect-video w-64 overflow-hidden rounded-md border border-ink/10 bg-primary-deep">
            {seriesBg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seriesBg}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "brightness(0.62)" }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center px-3 text-center text-[0.65rem] text-white/55">
                No hero background set on this series
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cutoutUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          {!seriesBg && (
            <p className="mt-1 text-[0.65rem] text-ink/45">
              Add a Hero background to this sermon&rsquo;s series (Series tab) so the speaker has a backdrop on
              the site.
            </p>
          )}
        </div>
      )}
      {err && <p className="mt-1 text-[0.7rem] font-semibold text-accent">{err}</p>}
    </div>
  );
}

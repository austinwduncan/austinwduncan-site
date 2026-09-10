"use client";

import FramedImage from "./FramedImage";
import { TARGET_PRESETS } from "@/lib/framing";

/*
  Thumbnail framing controls: a live card-crop preview (speaker over the series
  background), a target-spot grid (where the face should land), and a zoom
  slider. The focal point (where the face IS in the frame) is set by the
  FocusPicker above; this decides where it LANDS and how far to zoom.
*/
export default function FramingControls({
  src,
  seriesBg,
  focalX,
  focalY,
  targetX,
  targetY,
  zoom,
  onChange,
}: {
  src: string;
  seriesBg?: string;
  focalX: number;
  focalY: number;
  targetX: number;
  targetY: number;
  zoom: number;
  onChange: (patch: { heroTargetX?: number; heroTargetY?: number; heroZoom?: number }) => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-ink/10 bg-ink/[0.02] p-3">
      <p className="text-xs font-semibold text-ink/70">Thumbnail framing</p>
      <p className="mt-0.5 text-[0.7rem] text-ink/45">
        Choose where the speaker&rsquo;s face lands, then zoom to fine-tune. The preview is the real card crop.
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        {/* live card-crop preview */}
        <div className="relative aspect-[4/3] w-48 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-primary-deep">
          {seriesBg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={seriesBg}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "contrast(0.98) brightness(0.5) blur(2px)" }}
            />
          )}
          <FramedImage
            src={src}
            focalX={focalX}
            focalY={focalY}
            targetX={targetX}
            targetY={targetY}
            zoom={zoom}
            className="absolute inset-0 h-full w-full"
            imgStyle={{ filter: "contrast(1.14) brightness(0.95) saturate(0.9)" }}
          />
          {/* target marker */}
          <span
            aria-hidden
            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/85 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
            style={{ left: `${targetX}%`, top: `${targetY}%` }}
          />
        </div>

        {/* controls */}
        <div className="min-w-[190px] flex-1">
          <p className="text-[0.7rem] font-medium text-ink/70">Where the face lands</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {TARGET_PRESETS.map((p) => {
              const active = targetX === p.x && targetY === p.y;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => onChange({ heroTargetX: p.x, heroTargetY: p.y })}
                  className={`rounded-md border px-2 py-2 text-[0.62rem] font-semibold transition ${
                    active
                      ? "border-secondary bg-secondary/10 text-ink"
                      : "border-ink/15 text-ink/60 hover:border-ink/40"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[0.7rem] font-medium text-ink/70">
              <span>Zoom</span>
              <span>{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={2.6}
              step={0.05}
              value={zoom}
              onChange={(e) => onChange({ heroZoom: Number(e.target.value) })}
              className="mt-1 w-full accent-[color:var(--cw-secondary)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

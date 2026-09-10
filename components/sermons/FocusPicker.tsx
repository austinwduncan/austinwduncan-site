"use client";

import { useEffect, useRef, useState } from "react";
import { focalPosition } from "@/lib/focal";

/*
  Set where the hero frames the speaker: click/drag the dot onto the face. The two
  previews use the exact same focal math as the hero (the face is centered in its
  region), so they show precisely how it'll crop on desktop and mobile — WYSIWYG.
*/

const GRADE = "grayscale(1) contrast(1.45) brightness(1.12)";

function Preview({ url, fx, fy, tx, label, className }: { url: string; fx: number; fy: number; tx: number; label: string; className: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const measure = () => {
    const el = boxRef.current;
    if (el) setDim({ w: el.clientWidth, h: el.clientHeight });
  };
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const pos = nat && dim ? focalPosition(dim.w, dim.h, nat.w, nat.h, fx, fy, tx, 0.4) : null;
  return (
    <div>
      <div ref={boxRef} className={`relative overflow-hidden rounded-md ring-1 ring-ink/15 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          onLoad={(e) => {
            setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
            measure();
          }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: pos ? `${pos.x}% ${pos.y}%` : "50% 38%", filter: GRADE }}
        />
      </div>
      <p className="mt-1 text-center text-[0.65rem] uppercase tracking-wide text-ink/45">{label}</p>
    </div>
  );
}

export default function FocusPicker({
  url,
  x,
  y,
  onChange,
}: {
  url: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function set(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
    const ny = Math.round(Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100)));
    onChange(nx, ny);
  }

  return (
    <div>
      <p className="mb-1.5 text-xs text-ink/60">
        Click the speaker&rsquo;s face — the hero centers the framing on it. The previews show how it&rsquo;ll crop.
      </p>
      <div
        ref={ref}
        onPointerDown={(e) => set(e.clientX, e.clientY)}
        onPointerMove={(e) => {
          if (e.buttons === 1) set(e.clientX, e.clientY);
        }}
        className="relative w-full cursor-crosshair touch-none overflow-hidden rounded-lg ring-1 ring-ink/15"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="block w-full select-none" draggable={false} />
        <span
          aria-hidden
          className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)]"
          style={{ left: `${x}%`, top: `${y}%`, background: "rgba(123,155,181,0.55)" }}
        />
      </div>

      <div className="mt-3 flex items-start gap-3">
        <Preview url={url} fx={x} fy={y} tx={0.6} label="Desktop" className="aspect-[6/5] w-28" />
        <Preview url={url} fx={x} fy={y} tx={0.5} label="Mobile" className="aspect-[9/16] w-20" />
        <p className="ml-auto text-[0.7rem] text-ink/45">Focus<br />{x}% / {y}%</p>
      </div>
    </div>
  );
}

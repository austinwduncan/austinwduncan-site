"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { frameTransform, DEFAULT_TARGET_X, DEFAULT_TARGET_Y, DEFAULT_ZOOM } from "@/lib/framing";

/*
  Renders an image framed so the speaker's face (focal point) lands on the chosen
  target spot at the chosen zoom. Measures the container + the image's natural
  size, then sizes/translates the image to cover the box with the face on target.
  Used for the thumbnail cards and the message hero so framing is consistent.
*/
export default function FramedImage({
  src,
  focalX = 50,
  focalY = 35,
  targetX = DEFAULT_TARGET_X,
  targetY = DEFAULT_TARGET_Y,
  zoom = DEFAULT_ZOOM,
  className = "",
  imgStyle,
  onError,
}: {
  src: string;
  focalX?: number;
  focalY?: number;
  targetX?: number;
  targetY?: number;
  zoom?: number;
  className?: string;
  imgStyle?: React.CSSProperties;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [box, setBox] = useState<{ width: number; height: number; tx: number; ty: number } | null>(null);

  const layout = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img || !img.naturalWidth) return;
    setBox(
      frameTransform(
        wrap.clientWidth,
        wrap.clientHeight,
        img.naturalWidth,
        img.naturalHeight,
        focalX,
        focalY,
        targetX,
        targetY,
        zoom,
      ),
    );
  }, [focalX, focalY, targetX, targetY, zoom]);

  useEffect(() => {
    layout();
    const wrap = wrapRef.current;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(layout) : null;
    if (ro && wrap) ro.observe(wrap);
    window.addEventListener("resize", layout);
    return () => {
      window.removeEventListener("resize", layout);
      ro?.disconnect();
    };
  }, [layout]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onLoad={layout}
        onError={onError}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          maxWidth: "none",
          width: box ? `${box.width}px` : "100%",
          height: box ? `${box.height}px` : "100%",
          transform: box ? `translate(${box.tx}px, ${box.ty}px)` : undefined,
          objectFit: box ? undefined : "cover",
          ...imgStyle,
        }}
      />
    </div>
  );
}

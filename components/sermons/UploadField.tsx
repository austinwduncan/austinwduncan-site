"use client";

import { useRef, useState } from "react";

/*
  Upload control for sermon/series artwork or a study-guide document. Posts to
  /api/sermons/upload and returns the public URL (+ filename for documents).
  Shows an image preview for artwork, or the filename for documents.
*/
export default function UploadField({
  kind,
  url,
  name,
  onChange,
  hint,
}: {
  kind: "artwork" | "document" | "hero-background" | "hero-still" | "speaker";
  url: string;
  name?: string;
  onChange: (url: string, name?: string) => void;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/sermons/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) onChange(data.url, data.name);
      else setErr(data.error === "too_large" ? "File is too large." : "Upload failed.");
    } catch {
      setErr("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={kind === "document" ? ".pdf,.doc,.docx,.txt,.md" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {kind !== "document" && url ? (
        <div className="relative overflow-hidden rounded-lg border border-ink/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="aspect-video w-full object-cover" />
        </div>
      ) : null}
      {kind === "document" && url ? (
        <p className="mb-2 truncate text-sm text-ink/75">
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
            {name || "Current document"}
          </a>
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="rounded-full border border-ink/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:border-ink/50 disabled:opacity-50"
        >
          {busy ? "Uploading…" : url ? "Replace" : kind === "document" ? "Upload file" : "Upload image"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => onChange("", undefined)}
            className="text-xs font-semibold uppercase tracking-widest text-ink/45 hover:text-ink"
          >
            Remove
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
      {err && <p className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/*
  Always-mounted, page-level home for the Notes drawer + toast + Share, driven by
  window events so any button (hero, article) can trigger them:
    - `cw:notes`  → open the notes drawer
    - `cw:share`  → native share / copy link
  Notes are saved per-sermon in the visitor's own browser (localStorage), which
  the UI states plainly.
*/
export default function SermonNotes({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const key = `crosswalk-notes-${slug}`;

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  function openNotes() {
    try {
      setNotes(localStorage.getItem(key) ?? "");
    } catch {
      /* ignore */
    }
    setOpen(true);
    setTimeout(() => areaRef.current?.focus(), 200);
  }

  async function doShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title, text: title, url });
      else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied");
      }
    } catch {
      /* user dismissed */
    }
  }

  useEffect(() => {
    const onNotes = () => openNotes();
    const onShare = () => doShare();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("cw:notes", onNotes);
    window.addEventListener("cw:share", onShare);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("cw:notes", onNotes);
      window.removeEventListener("cw:share", onShare);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveNotes() {
    try {
      localStorage.setItem(key, notes);
      showToast("Notes saved");
    } catch {
      showToast("Couldn't save notes");
    }
  }

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-[110] w-[min(430px,100%)] border-l border-white/10 bg-[#10151c] p-7 text-white shadow-[-30px_0_100px_rgba(0,0,0,.45)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-[105%]"
        }`}
        role="dialog"
        aria-modal={open}
        aria-label="Message notes"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide">Message notes</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close notes" className="text-2xl leading-none text-white/70 hover:text-white">
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-white/55">Saved in this browser, on this device.</p>
        <textarea
          ref={areaRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write what stands out to you…"
          className="mt-5 h-[60vh] w-full resize-none rounded-2xl border border-white/10 bg-[#080b10] p-4 leading-relaxed text-white outline-none focus:border-secondary"
        />
        <button
          type="button"
          onClick={saveNotes}
          className="mt-3 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-transform duration-200 hover:scale-[1.01]"
        >
          Save notes
        </button>
      </div>
      {open && (
        <button type="button" aria-label="Close notes" onClick={() => setOpen(false)} className="fixed inset-0 z-[105] bg-black/50" />
      )}

      <div
        aria-live="polite"
        className={`fixed bottom-7 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-xl transition-all duration-200 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </>
  );
}

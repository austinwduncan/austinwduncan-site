"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { linkifyReferences } from "@/lib/bibleRefs";

/*
  Sermon Scripture experience. After hydration we linkify references inside the
  article (see bibleRefs), then a click on any reference slides a passage drawer
  in from the left (mirrors the baptism BeliefsDrawer) with the ESV text, which
  scrolls for longer passages. The key stays server-side behind /api/passage.
*/

const display = "font-[family-name:var(--font-display)]";

type Loaded =
  | { status: "loading" }
  | { status: "ok"; canonical: string; html: string }
  | { status: "unconfigured" }
  | { status: "error"; canonical: string };

export default function SermonScripture() {
  const [reference, setReference] = useState<string | null>(null);
  const [data, setData] = useState<Loaded>({ status: "loading" });

  // Linkify the article once, then open the drawer on any reference click.
  useEffect(() => {
    const article = document.querySelector<HTMLElement>("article[data-sermon]");
    if (!article) return;
    linkifyReferences(article);
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>(".verse-ref");
      if (!btn) return;
      e.preventDefault();
      setReference(btn.getAttribute("data-ref"));
    };
    article.addEventListener("click", onClick);
    return () => article.removeEventListener("click", onClick);
  }, []);

  const close = useCallback(() => setReference(null), []);

  // Fetch the passage whenever a reference opens; lock scroll + Esc to close.
  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    setData({ status: "loading" });

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    fetch(`/api/passage?ref=${encodeURIComponent(reference)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (r.status === 503) setData({ status: "unconfigured" });
        else if (!r.ok) setData({ status: "error", canonical: body.canonical ?? reference });
        else setData({ status: "ok", canonical: body.canonical ?? reference, html: body.html });
      })
      .catch(() => {
        if (!cancelled) setData({ status: "error", canonical: reference });
      });

    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [reference, close]);

  const title = reference
    ? data.status === "ok" || data.status === "error"
      ? data.canonical
      : reference
    : "";
  const bgUrl = reference
    ? `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=ESV`
    : "#";

  return (
    <AnimatePresence>
      {reference && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title}, English Standard Version`}
            className="fixed left-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-8 py-6 lg:px-10">
              <div>
                <p className={`${display} text-xs uppercase tracking-[0.25em] text-accent`}>English Standard Version</p>
                <p className={`${display} mt-1 text-2xl tracking-wide text-ink`}>{title}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-7 lg:px-10">
              {data.status === "loading" && (
                <p className="text-sm text-ink/50">Loading the passage…</p>
              )}
              {data.status === "ok" && (
                <div
                  className="passage-body"
                  dangerouslySetInnerHTML={{ __html: data.html }}
                />
              )}
              {data.status === "unconfigured" && (
                <p className="leading-relaxed text-ink/70">
                  The passage viewer isn&rsquo;t set up yet. You can{" "}
                  <a href={bgUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
                    read {reference} here
                  </a>
                  .
                </p>
              )}
              {data.status === "error" && (
                <p className="leading-relaxed text-ink/70">
                  We couldn&rsquo;t load that passage. You can{" "}
                  <a href={bgUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
                    read it here
                  </a>
                  .
                </p>
              )}
            </div>

            <div className="border-t border-ink/10 px-8 py-4 lg:px-10">
              <a
                href={bgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-widest text-accent transition-colors hover:text-ink"
              >
                Open full chapter &rarr;
              </a>
              <p className="mt-2 text-[0.7rem] leading-relaxed text-ink/45">
                Scripture quotations are from the ESV® Bible, © 2001 by Crossway. Used by permission. All rights reserved.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";

/*
  Self-contained Scripture Atlas: the whole Bible on one page. Pick a book and its
  coverage + messages update inline — no drilling into separate pages.
*/

type BookLite = { slug: string; name: string; testament: "OT" | "NT"; chapters: number };
type Msg = { slug: string; href: string; title: string; speaker: string; date: string | null };
type Detail = { count: number; chapterCounts: number[]; messages: Msg[] };

const display = "font-[family-name:var(--font-display)]";

function fmt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T12:00:00Z");
  return Number.isNaN(d.getTime()) ? null : new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(d);
}

export default function ScriptureAtlas({ books, detail, initial }: { books: BookLite[]; detail: Record<string, Detail>; initial?: string }) {
  const taught = books.filter((b) => detail[b.slug]);
  const [sel, setSel] = useState<string>(initial && detail[initial] ? initial : taught[0]?.slug ?? "");
  const book = books.find((b) => b.slug === sel);
  const d = sel ? detail[sel] : undefined;
  const maxCh = d ? Math.max(1, ...d.chapterCounts) : 1;

  const grid = (t: "OT" | "NT") => (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
      {books.filter((b) => b.testament === t).map((b) => {
        const has = Boolean(detail[b.slug]);
        const on = b.slug === sel;
        return has ? (
          <button
            key={b.slug}
            type="button"
            onClick={() => setSel(b.slug)}
            aria-pressed={on}
            className={`rounded-lg border px-2.5 py-2 text-left text-sm leading-tight transition-colors ${
              on ? "border-secondary bg-secondary text-primary-deep" : "border-secondary/40 bg-secondary/[0.14] text-white hover:bg-secondary/25"
            }`}
          >
            {b.name}
            <span className={`ml-1 text-[0.68rem] font-semibold ${on ? "text-primary-deep/70" : "text-secondary-soft"}`}>{detail[b.slug].count}</span>
          </button>
        ) : (
          <span key={b.slug} className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-2.5 py-2 text-sm leading-tight text-white/25">
            {b.name}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(20rem,26rem)]">
      {/* the map */}
      <div>
        <h2 className={`${display} text-lg uppercase tracking-wide text-white/80`}>Old Testament</h2>
        <div className="mt-3">{grid("OT")}</div>
        <h2 className={`${display} mt-8 text-lg uppercase tracking-wide text-white/80`}>New Testament</h2>
        <div className="mt-3">{grid("NT")}</div>
      </div>

      {/* the selected book, inline */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        {book && d ? (
          <div className="rounded-2xl border border-white/10 bg-[#0e191d] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-soft">{book.testament === "OT" ? "Old Testament" : "New Testament"}</p>
            <h3 className={`${display} mt-1 text-4xl uppercase leading-none tracking-wide text-white`}>{book.name}</h3>
            <p className="mt-2 text-sm text-white/55">{d.count} {d.count === 1 ? "message" : "messages"} · {book.chapters} chapters</p>

            <p className="mt-6 mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-white/45">Teaching by chapter</p>
            <div className="flex items-end gap-0.5" style={{ height: "64px" }}>
              {d.chapterCounts.map((n, i) => (
                <div
                  key={i}
                  title={`${book.name} ${i + 1}: ${n} ${n === 1 ? "message" : "messages"}`}
                  className={`min-w-[3px] flex-1 rounded-t ${n > 0 ? "bg-gradient-to-t from-secondary/30 to-secondary" : "bg-white/[0.06]"}`}
                  style={{ height: `${n > 0 ? 10 + (n / maxCh) * 52 : 4}px` }}
                />
              ))}
            </div>

            <ul className="mt-6 divide-y divide-white/10">
              {d.messages.map((m) => (
                <li key={m.slug}>
                  <a href={m.href} className="block py-3 transition-colors hover:text-secondary-soft">
                    <span className="block text-sm font-semibold leading-snug text-white">{m.title}</span>
                    <span className="mt-0.5 block text-xs text-white/50">{[m.speaker, fmt(m.date)].filter(Boolean).join(" · ")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0e191d] p-6 text-white/55">
            Tag your messages with Scripture and the books you&rsquo;ve taught will light up here.
          </div>
        )}
      </aside>
    </div>
  );
}

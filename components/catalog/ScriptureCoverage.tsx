import Link from "next/link";
import type { Coverage } from "@/lib/browse";
import { display, kicker } from "./card";

/* The Scripture Atlas block: which books have been taught, linking into /library/bible. */
export default function ScriptureCoverage({ coverage, className = "" }: { coverage: Coverage[]; className?: string }) {
  return (
    <section className={`px-6 lg:px-10 ${className}`}>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/[0.1] to-white/[0.02] p-7 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={kicker}>Browse the Bible</p>
            <h2 className={`${display} mt-2 text-3xl uppercase tracking-wide text-white sm:text-4xl`}>Scripture Atlas</h2>
            <p className="mt-2 max-w-lg text-sm text-white/65">See where the teaching has gone, book by book, and how passages connect across series.</p>
          </div>
          <Link href="/library/bible" className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-transform duration-200 hover:scale-[1.03]">
            Open the Atlas
          </Link>
        </div>
        {coverage.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {coverage.map((c) => (
              <Link
                key={c.book.slug}
                href={`/library/bible?book=${c.book.slug}`}
                className="rounded-full border border-secondary/40 bg-secondary/10 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary/20"
              >
                {c.book.name} <span className="text-white/45">{c.sermonCount}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

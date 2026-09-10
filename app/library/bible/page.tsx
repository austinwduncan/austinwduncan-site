import type { Metadata } from "next";
import Link from "next/link";
import ScriptureAtlas from "@/components/watch/ScriptureAtlas";
import { display, kicker } from "@/components/catalog/card";
import { getPublishedSermons } from "@/lib/sermons";
import { coverageFrom, sermonsForBookChapter, sermonsForBookSlug } from "@/lib/browse";
import { pathFor } from "@/lib/categories";
import { BOOKS } from "@/lib/bible";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Scripture Atlas",
  description: "Browse every book of the Bible and see where Austin has taught.",
};

export default async function BiblePage({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const { book } = await searchParams;
  const pieces = await getPublishedSermons();
  const cov = coverageFrom(pieces);

  const detail: Record<string, { count: number; chapterCounts: number[]; messages: { slug: string; href: string; title: string; speaker: string; date: string | null }[] }> = {};
  for (const c of cov) {
    const items = sermonsForBookSlug(pieces, c.book.slug);
    detail[c.book.slug] = {
      count: c.sermonCount,
      chapterCounts: Array.from({ length: c.book.chapters }, (_, i) => sermonsForBookChapter(pieces, c.book.slug, i + 1).length),
      messages: items.map((s) => ({ slug: s.slug, href: pathFor(s), title: s.title, speaker: s.speaker, date: s.date ?? null })),
    };
  }
  const books = BOOKS.map((b) => ({ slug: b.slug, name: b.name, testament: b.testament, chapters: b.chapters }));

  return (
    <div className="flex-1 bg-[#0a0e10]">
      <section className="px-6 pb-16 pt-28 lg:px-10 lg:pt-32">
        <Link href="/" className={`${kicker} transition-colors hover:text-white`}>&larr; The library</Link>
        <p className={`mt-6 ${kicker}`}>Browse the Bible</p>
        <h1 className={`${display} mt-1 text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-none tracking-tight text-white`}>Scripture Atlas</h1>
        <p className="mt-3 max-w-xl text-white/60">
          {cov.length > 0 ? (
            <>Austin has taught in <span className="font-semibold text-white">{cov.length}</span> of 66 books. Pick one to see its coverage and pieces.</>
          ) : (
            "Tag pieces with Scripture and the books taught will light up here."
          )}
        </p>
        <div className="mt-10">
          <ScriptureAtlas books={books} detail={detail} initial={book} />
        </div>
      </section>
    </div>
  );
}

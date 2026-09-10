import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SermonGrid from "@/components/watch/SermonGrid";
import { toCardPiece, display, kicker } from "@/components/catalog/card";
import { getPublishedSermons, slugify } from "@/lib/sermons";
import { sermonsByTopicSlug } from "@/lib/browse";

export const revalidate = 600;

async function load(slug: string) {
  const pieces = await getPublishedSermons();
  const items = sermonsByTopicSlug(pieces, slug);
  const label = items[0]?.topics?.find((t) => slugify(t) === slug) ?? slug.replace(/-/g, " ");
  return { items, label };
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const { label } = await load(topic);
  return { title: label, description: `Teaching from Austin W. Duncan on ${label}.` };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const { items, label } = await load(topic);
  if (items.length === 0) notFound();

  return (
    <div className="flex-1 bg-[#0a0e10]">
      <section className="px-6 pb-14 pt-28 lg:px-10 lg:pt-32">
        <Link href="/" className={`${kicker} transition-colors hover:text-white`}>&larr; The library</Link>
        <p className={`mt-6 ${kicker}`}>Topic</p>
        <h1 className={`${display} mt-1 text-[clamp(2.25rem,6vw,4.5rem)] uppercase capitalize leading-none tracking-wide text-white`}>{label}</h1>
        <p className="mt-2 text-sm text-white/55">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
        <div className="mt-10">
          <SermonGrid sermons={items.map(toCardPiece)} />
        </div>
      </section>
    </div>
  );
}

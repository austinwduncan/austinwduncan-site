import type { Metadata } from "next";
import { getPublishedByCategory, type Sermon } from "@/lib/sermons";
import { COLLECTION_DEFS } from "@/data/exegetica-collections";
import { PageHeader, PillLink, pageStyle, wrap, h2Style, MIST, GOLD_INK } from "@/components/bright/PageHeader";
import { PieceRow, RowList } from "@/components/bright/Rows";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Exegetica",
  description: "Scholarly papers on exegesis, biblical languages and the history of interpretation, grouped by field.",
};

async function load(): Promise<Sermon[]> {
  try {
    return await getPublishedByCategory("paper");
  } catch (e) {
    console.warn("[exegetica] could not load", e);
    return [];
  }
}

export default async function ExegeticaPage() {
  const papers = await load();
  const bySlug = new Map(papers.map((p) => [p.slug, p]));

  const collections = COLLECTION_DEFS.map((c) => ({
    ...c,
    items: c.slugs.map((s) => bySlug.get(s)).filter((p): p is Sermon => Boolean(p)),
  })).filter((c) => c.items.length > 0);
  const placed = new Set(collections.flatMap((c) => c.items.map((p) => p.slug)));
  const rest = papers.filter((p) => !placed.has(p.slug));

  const groups = [
    ...collections.map((c) => ({ id: c.id, title: c.title, subtitle: c.subtitle, desc: c.desc, items: c.items })),
    ...(rest.length > 0 ? [{ id: "more", title: "More papers", subtitle: "", desc: "", items: rest }] : []),
  ];

  return (
    <div style={pageStyle}>
      <PageHeader title="Exegetica" count={papers.length} countLabel="papers" />

      <div className={`${wrap} py-8 lg:py-10`}>
        <p className="max-w-[58ch] text-[1.1rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
          Longer, footnoted work on exegesis, the biblical languages and the history of interpretation, grouped by field.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {groups.map((g) => (
            <PillLink key={g.id} href={`#${g.id}`} tone="outline">
              {g.title} <span className="ml-1 tabular-nums opacity-60">{g.items.length}</span>
            </PillLink>
          ))}
        </div>
      </div>

      {groups.map((g, i) => (
        <section key={g.id} id={g.id} className="scroll-mt-20" style={{ background: i % 2 === 0 ? MIST : "#FFFFFF" }}>
          <div className={`${wrap} grid gap-6 py-12 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-14 lg:py-16`}>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-balance" style={h2Style}>{g.title}</h2>
              {g.subtitle && (
                <p className="mt-3 text-[0.98rem] font-semibold" style={{ color: GOLD_INK }}>{g.subtitle}</p>
              )}
              {g.desc && (
                <p className="mt-3 max-w-[44ch] text-[0.98rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.72)" }}>{g.desc}</p>
              )}
            </div>
            <RowList>
              {g.items.map((p) => (
                <PieceRow key={p.slug} piece={p} summary date={false} />
              ))}
            </RowList>
          </div>
        </section>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { getPublishedByCategory, type Sermon } from "@/lib/sermons";
import { slugify } from "@/lib/sermons";
import { PageHeader, PillLink, pageStyle, wrap, h2Style, MIST } from "@/components/bright/PageHeader";
import { PieceRow, RowList } from "@/components/bright/Rows";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Word for Word",
  description: "Short answers to real questions about the Bible, theology and the Christian life, grouped by subject.",
};

/*
  A few early episodes were imported with a generic placeholder summary and no
  real body yet. They stay reachable by link but are left off this page until
  they are written.
*/
const isStub = (p: Sermon) => /^A careful biblical answer to the question/i.test(p.summary || p.description || "");

/** "Basic Christian Thought & Spiritual Growth" and "... and ..." are one subject. */
const subjectKey = (t: string) => slugify(t.replace(/&/g, "and"));

async function load(): Promise<Sermon[]> {
  try {
    return await getPublishedByCategory("episode");
  } catch (e) {
    console.warn("[word-for-word] could not load", e);
    return [];
  }
}

export default async function WordForWordPage() {
  const all = (await load()).filter((p) => !isStub(p));

  // one group per subject, largest first; a piece sits under its first subject
  const groups = new Map<string, { label: string; items: Sermon[] }>();
  for (const p of all) {
    const label = (p.topics?.[0] ?? "Other questions").replace(/&/g, "and");
    const key = subjectKey(label);
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(p);
  }
  const subjects = [...groups.entries()].sort((a, b) => b[1].items.length - a[1].items.length);

  return (
    <div style={pageStyle}>
      <PageHeader title="Word for Word" count={all.length} countLabel="questions answered" />

      <div className={`${wrap} py-8 lg:py-10`}>
        <p className="max-w-[56ch] text-[1.1rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
          Short answers to real questions about the Bible, theology and the Christian life. Pick a subject.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {subjects.map(([key, g]) => (
            <PillLink key={key} href={`#${key}`} tone="outline">
              {g.label} <span className="ml-1 tabular-nums opacity-60">{g.items.length}</span>
            </PillLink>
          ))}
        </div>
      </div>

      {subjects.map(([key, g], i) => (
        <section key={key} id={key} className="scroll-mt-20" style={{ background: i % 2 === 0 ? MIST : "#FFFFFF" }}>
          <div className={`${wrap} grid gap-6 py-12 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-14 lg:py-16`}>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-balance" style={h2Style}>{g.label}</h2>
              <p className="mt-2 text-[0.9rem] font-semibold" style={{ color: "rgba(28,36,39,0.6)" }}>
                {g.items.length} {g.items.length === 1 ? "question" : "questions"}
              </p>
            </div>
            <RowList>
              {g.items.map((p) => (
                <PieceRow key={p.slug} piece={p} date={false} />
              ))}
            </RowList>
          </div>
        </section>
      ))}
    </div>
  );
}

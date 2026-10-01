import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedByCategory, type Sermon } from "@/lib/sermons";
import { pathFor } from "@/lib/categories";
import { PageHeader, pageStyle, wrap, INK, GOLD_INK, DISPLAY, T3 } from "@/components/bright/PageHeader";
import { fmtDate } from "@/components/bright/Rows";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Forum & Pulpit",
  description: "Pastoral responses to public events, written from Scripture, in the order they happened.",
};

async function load(): Promise<Sermon[]> {
  try {
    return await getPublishedByCategory("commentary");
  } catch (e) {
    console.warn("[forum-and-pulpit] could not load", e);
    return [];
  }
}

export default async function ForumPage() {
  const pieces = await load();

  return (
    <div style={pageStyle}>
      <PageHeader title="Forum & Pulpit" count={pieces.length} countLabel="pieces" />

      <div className={`${wrap} py-8 lg:py-10`}>
        <p className="max-w-[58ch] text-[1.1rem] leading-relaxed" style={{ color: "rgba(28,36,39,0.75)" }}>
          When something in the news lands on a congregation, a pastor has to say something true and useful. These are
          those responses, newest first.
        </p>
      </div>

      {/* each piece answers a moment, so the date leads */}
      <ol className={`${wrap} pb-20 lg:pb-28`} style={{ borderTop: `3px solid ${INK}` }}>
        {pieces.map((p) => (
          <li key={p.slug} style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
            <Link
              href={pathFor(p)}
              className="group grid gap-2 px-2 py-7 transition-colors duration-150 hover:bg-[#1C2427] hover:text-white focus-visible:bg-[#1C2427] focus-visible:text-white focus-visible:outline-none lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10"
            >
              <span
                className="text-[0.95rem] font-semibold tabular-nums group-hover:text-[#9DB4C8] group-focus-visible:text-[#9DB4C8]"
                style={{ color: GOLD_INK }}
              >
                {fmtDate(p.date, "long")}
              </span>
              <span>
                <span className="block text-balance" style={{ fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", fontSize: T3, lineHeight: 1, letterSpacing: "0.01em" }}>
                  {p.title}
                </span>
                {(p.summary || p.description) && (
                  <span className="mt-3 line-clamp-3 block max-w-[74ch] text-[1rem] leading-relaxed opacity-75">
                    {p.summary || p.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

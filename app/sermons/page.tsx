import type { Metadata } from "next";
import CategoryList from "@/components/bright/CategoryList";
import { PillLink, wrap, h2Style, INK } from "@/components/bright/PageHeader";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Sermons",
  description: "Sermons preached by Austin W. Duncan, each with the video and the full text.",
};

export default function SermonsPage() {
  return (
    <CategoryList
      category="sermon"
      title="Sermons"
      countLabel="with the full text"
      footer={
        <>
          {/* ── Two other ways in ──────────────────────────────────────────────── */}
          <section style={{ background: INK, color: "#FFFFFF" }}>
            <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-2 lg:py-24`}>
              <div>
                <h2 style={h2Style}>Looking for a passage?</h2>
                <p className="mt-5 max-w-[44ch] text-[1rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                  See every book of the Bible I have preached or taught from, chapter by chapter.
                </p>
                <div className="mt-7"><PillLink href="/library/bible" tone="gold">Browse by Scripture</PillLink></div>
              </div>
              <div>
                <h2 style={h2Style}>Want to go book by book?</h2>
                <p className="mt-5 max-w-[44ch] text-[1rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                  The teaching series walk through a book or a theme one session at a time, in writing.
                </p>
                <div className="mt-7"><PillLink href="/series" tone="gold">See the series</PillLink></div>
              </div>
            </div>
          </section>
        </>
      }
    />
  );
}

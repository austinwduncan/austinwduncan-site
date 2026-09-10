import type { Metadata } from "next";
import AdminLogin from "@/components/AdminLogin";
import SermonsWorkspace from "@/components/sermons/SermonsWorkspace";
import { canManage } from "@/lib/adminSession";
import { getAllSermons } from "@/lib/sermons";
import { getAllSeries } from "@/lib/series";
import { getAllSpeakers } from "@/lib/speakers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sermons",
  robots: { index: false, follow: false },
};

const display = "font-[family-name:var(--font-display)]";

export default async function StaffSermonsPage() {
  const ok = await canManage("sermons");
  const [sermons, series, speakers] = ok
    ? await Promise.all([getAllSermons(), getAllSeries(), getAllSpeakers()])
    : [[], [], []];

  return (
    <>
      <div className={ok ? "flex-1 bg-white" : "flex-1 bg-primary-deep"}>
        <section className="bg-primary-deep pt-40 pb-16 lg:pt-48 lg:pb-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <a
              href="/staff"
              className="text-xs font-semibold uppercase tracking-widest text-secondary-soft hover:text-white"
            >
              &larr; Staff Tools
            </a>
            <h1 className={`${display} mt-4 text-4xl tracking-wide text-white sm:text-5xl`}>
              Library
            </h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
              Publish sermons, teaching sessions, Word for Word episodes, papers and commentary
              from one place: paste a video and it drafts the record, or paste a manuscript and press Format. Each piece appears under its category, for example{" "}
              <span className="text-secondary-soft">/sermons/[slug]</span>.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-14">
          {ok ? (
            <SermonsWorkspace sermons={sermons} series={series} speakers={speakers} />
          ) : (
            <AdminLogin
              endpoint="/api/staff/auth"
              area="sermons"
              title="Sermons"
              subtitle="Enter the sermons passcode to manage sermons."
            />
          )}
        </section>
      </div>
    </>
  );
}

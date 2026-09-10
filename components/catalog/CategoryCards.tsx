import Link from "next/link";
import { CATEGORIES, CATEGORY_ORDER, type Category } from "@/lib/categories";
import { display, kicker } from "./card";

/*
  The five doors of the library: one card per category with its label, blurb
  and a live count of published pieces. A category with nothing published yet
  still gets its card, so the shape of the site is visible before it fills.
*/
export default function CategoryCards({ counts, className = "" }: { counts: Record<Category, number>; className?: string }) {
  return (
    <section className={`px-6 lg:px-10 ${className}`}>
      <p className={kicker}>Everything in one place</p>
      <h2 className={`${display} mt-2 text-2xl uppercase tracking-wide text-white sm:text-3xl`}>Browse the library</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORY_ORDER.map((key) => {
          const c = CATEGORIES[key];
          const n = counts[key] ?? 0;
          return (
            <Link
              key={key}
              href={`/${c.path}`}
              className="group flex min-h-[11rem] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/[0.12] to-white/[0.02] p-5 transition-colors hover:border-secondary/50 hover:from-secondary/20"
            >
              <div>
                <span aria-hidden className="block h-[3px] w-8 rounded-full bg-secondary transition-all duration-500 ease-out group-hover:w-12" />
                <b className={`${display} mt-4 block text-2xl uppercase leading-none tracking-wide text-white`}>{c.label}</b>
                <span className="mt-2.5 block text-sm leading-snug text-white/60">{c.blurb}</span>
              </div>
              <span className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-soft">
                {n} {n === 1 ? c.noun : c.nouns}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

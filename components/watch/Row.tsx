import type { ReactNode } from "react";

/* A titled horizontal-scroll row (Netflix-style). Children are fixed-width cards. */
export default function Row({
  title,
  href,
  seeAll = "See all",
  children,
}: {
  title: string;
  href?: string;
  seeAll?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-3 flex items-baseline justify-between gap-4 px-6 lg:px-10">
        <h2 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-white sm:text-2xl">
          {title}
        </h2>
        {href && (
          <a href={href} className="shrink-0 text-xs font-semibold uppercase tracking-widest text-secondary-soft transition-colors hover:text-white">
            {seeAll} &rarr;
          </a>
        )}
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin] lg:px-10">
        {children}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

/*
  Staff dashboard shell. A grouped sidebar (vertical on desktop, a horizontal
  scrolling tab strip on mobile) drives which module shows in the main panel.
  Panels are all mounted and toggled with `hidden` so switching sections never
  loses a half-edited form. Items with an href are links to their own pages.
*/

export type DashItem = {
  id: string;
  label: string;
  panel?: React.ReactNode;
  href?: string;
};
export type DashGroup = { label: string; items: DashItem[] };

export default function StaffDashboard({ groups }: { groups: DashGroup[] }) {
  const allItems = groups.flatMap((g) => g.items);
  const panels = allItems.filter((i) => i.panel);
  const [active, setActive] = useState(panels[0]?.id ?? "");
  const activeLabel = panels.find((p) => p.id === active)?.label ?? "";

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.25em] text-secondary-soft">
                {g.label}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((item) =>
                  item.href ? (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        {item.label}
                        <span aria-hidden className="text-white/30">&#8599;</span>
                      </a>
                    </li>
                  ) : (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActive(item.id)}
                        aria-current={active === item.id ? "page" : undefined}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          active === item.id
                            ? "bg-secondary/20 font-semibold text-white"
                            : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile tab strip */}
      <div className="-mx-6 mb-7 overflow-x-auto px-6 lg:hidden">
        <div className="flex w-max gap-2 pb-1">
          {allItems.map((item) =>
            item.href ? (
              <a
                key={item.id}
                href={item.href}
                className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
              >
                {item.label} &#8599;
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  active === item.id
                    ? "bg-white text-ink"
                    : "border border-white/20 text-white/80"
                }`}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Main panel */}
      <div className="min-w-0">
        {activeLabel && (
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl tracking-wide text-white lg:hidden">
            {activeLabel}
          </h2>
        )}
        {panels.map((p) => (
          <div key={p.id} className={active === p.id ? "" : "hidden"}>
            {p.panel}
          </div>
        ))}
      </div>
    </div>
  );
}

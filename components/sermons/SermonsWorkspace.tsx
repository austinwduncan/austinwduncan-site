"use client";

import { useState } from "react";
import SermonsEditor from "@/components/SermonsEditor";
import SeriesManager from "./SeriesManager";
import SpeakerManager from "./SpeakerManager";
import type { SermonRecord } from "@/lib/sermons";
import type { Series } from "@/lib/series";
import type { Speaker } from "@/lib/speakers";

const TABS = [
  ["sermons", "Sermons"],
  ["series", "Series"],
  ["speakers", "Speakers"],
] as const;
type Tab = (typeof TABS)[number][0];

/* Sermons / Series / Speakers tabs, sharing one series list so the sermon builder's
   series dropdown updates the moment you add or rename a series. */
export default function SermonsWorkspace({
  sermons,
  series,
  speakers,
}: {
  sermons: SermonRecord[];
  series: Series[];
  speakers: Speaker[];
}) {
  const [tab, setTab] = useState<Tab>("sermons");
  const [seriesList, setSeriesList] = useState<Series[]>(series);

  return (
    <div>
      <div className="mb-7 inline-flex rounded-full border border-ink/15 bg-white p-1">
        {TABS.map(([t, labelText]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              tab === t ? "bg-primary-deep text-white" : "text-ink/60 hover:text-ink"
            }`}
          >
            {labelText}
          </button>
        ))}
      </div>

      {tab === "sermons" ? (
        <SermonsEditor initial={sermons} series={seriesList} />
      ) : tab === "series" ? (
        <SeriesManager initial={seriesList} sermons={sermons} onChanged={setSeriesList} />
      ) : (
        <SpeakerManager initial={speakers} sermons={sermons} />
      )}
    </div>
  );
}

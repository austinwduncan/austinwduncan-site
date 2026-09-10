import SermonCard, { type CardPiece } from "./SermonCard";

/* Responsive grid of piece cards (the consistent episode-still thumbnails). */
export default function SermonGrid({ sermons }: { sermons: CardPiece[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {sermons.map((s) => (
        <SermonCard key={s.slug + String(s.date)} sermon={s} />
      ))}
    </div>
  );
}

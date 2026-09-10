/*
  Pull an 11-char YouTube video id out of whatever the user pastes: a full
  watch URL, youtu.be short link, /live, /embed, /shorts, or a bare id.
*/
export function parseYouTubeId(input: string): string | null {
  const s = (input ?? "").trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([\w-]{11})/, // watch?v=ID
    /youtu\.be\/([\w-]{11})/, // youtu.be/ID
    /\/(?:live|embed|shorts|v)\/([\w-]{11})/, // /live|embed|shorts|v/ID
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  const bare = s.match(/([\w-]{11})/);
  return bare ? bare[1] : null;
}

/*
  Tiny client-side controller shared by the sermon video, the table of contents,
  and the per-section jump buttons. One sermon renders at a time, so a module
  singleton is simpler than threading context through the server-rendered page.
*/

type YtPlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo?: () => void;
  pauseVideo?: () => void;
  getCurrentTime?: () => number;
};
type Listener = (t: number) => void;
type StateListener = (state: number) => void;

let player: YtPlayer | null = null;
const listeners = new Set<Listener>();
const stateListeners = new Set<StateListener>();
let last = { t: 0, at: 0 };

export function setPlayer(p: YtPlayer | null) {
  player = p;
}
export function hasPlayer() {
  return player !== null;
}
/** Seek the video to `seconds` and start playing. No-op without a player. */
export function seekTo(seconds: number) {
  if (!player) return;
  player.seekTo(seconds, true);
  player.playVideo?.();
}
/** Resume playback at the current position. No-op without a player. */
export function playVideo() {
  player?.playVideo?.();
}
/** Pause playback. No-op without a player. */
export function pauseVideo() {
  player?.pauseVideo?.();
}
/** Player state (YT.PlayerState numbers: 1 playing, 2 paused, 0 ended, …). */
export function reportState(state: number) {
  stateListeners.forEach((l) => l(state));
}
export function subscribeState(l: StateListener) {
  stateListeners.add(l);
  return () => {
    stateListeners.delete(l);
  };
}
/** Called by the player as it plays. Notifies subscribers (TOC follow-along). */
export function reportTime(t: number) {
  last = { t, at: Date.now() };
  listeners.forEach((l) => l(t));
}
/** True if the video reported time very recently (i.e. it is actively playing). */
export function isFollowing(withinMs = 1600) {
  return Date.now() - last.at < withinMs;
}
export function subscribeTime(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Seconds -> "m:ss" / "h:mm:ss". */
export function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

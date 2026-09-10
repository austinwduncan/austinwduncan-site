/*
  Speaker fallbacks. On the Crosswalk site this reads the church leadership
  table so a speaker page can borrow a headshot, role and bio. This site has no
  leadership table, so the map is always empty and speaker profiles come only
  from the speakers table managed at /staff/sermons.
*/
export type SpeakerFallback = { photoUrl?: string; role?: string; bio?: string };

export async function getLeadershipBySlug(): Promise<Map<string, SpeakerFallback>> {
  return new Map<string, SpeakerFallback>();
}

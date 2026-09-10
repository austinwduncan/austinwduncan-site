import crypto from "crypto";
import { cookies } from "next/headers";

/*
  Minimal signed-cookie session for the accountant's giving editor. A shared
  passcode (ACCOUNTANT_PASSCODE) unlocks a short-lived HMAC-signed cookie.
  The data is aggregate weekly totals (not donor PII), so a passcode gate is
  appropriate; can be upgraded to per-person magic-link email later.
*/

export const ADMIN_COOKIE = "cw_admin";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export type Role = "webmaster" | "staff" | "pastor" | "accountant" | "sermons" | "audit";
const ROLES: Role[] = ["webmaster", "staff", "pastor", "accountant", "sermons", "audit"];

// The webmaster master key unlocks every password prompt on the site and grants
// access to every gated area (plus the site-wide media editor). Env override,
// with a default so it works out of the box.
const WEBMASTER_PASSCODE = process.env.WEBMASTER_PASSCODE ?? "crosswalk-webmaster";

/*
  Each protected area has its own passcode env var. Staff is the master key: it
  opens every area (so staff never re-enter a password), while the per-area
  passcodes let us hand out access to just one area (e.g. a volunteer who only
  manages sermons). "giving" keeps its historical ACCOUNTANT_PASSCODE.
*/
export type Area = "staff" | "connect" | "sermons" | "audit" | "giving";
const AREA_CONFIG: Record<Area, { role: Role; env: string }> = {
  staff: { role: "staff", env: "STAFF_PASSCODE" },
  connect: { role: "pastor", env: "CONNECT_PASSCODE" },
  sermons: { role: "sermons", env: "SERMONS_PASSCODE" },
  audit: { role: "audit", env: "AUDIT_PASSCODE" },
  giving: { role: "accountant", env: "ACCOUNTANT_PASSCODE" },
};

// Areas that ship with a working default passcode (overridable via env). The
// Connect Groups command center is the pastor's personal dashboard; jubal2017
// unlocks it out of the box.
const DEFAULT_AREA_PASSCODE: Partial<Record<Area, string>> = {
  connect: "jubal2017",
};

/** Which roles are allowed into a given area (staff is master everywhere). */
const AREA_ROLES: Record<Area, Role[]> = {
  staff: ["staff"],
  // Connect Groups is the pastor's private command center: only jubal2017 (pastor)
  // and the webmaster master key open it. Staff must enter the jubal2017 password.
  connect: ["pastor"],
  sermons: ["staff", "sermons"],
  audit: ["staff", "audit"],
  giving: ["staff", "accountant"],
};

/**
 * Check a submitted passcode for an area and return the role it grants, or null.
 * Returns null (not an error) when the area's passcode env var is unset.
 */
function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function resolvePasscode(area: string, passcode: string): Role | null {
  if (!passcode) return null;
  // Master key: the webmaster passcode is accepted at any prompt, in any area.
  if (safeEqual(passcode, WEBMASTER_PASSCODE)) return "webmaster";
  const cfg = AREA_CONFIG[area as Area];
  if (!cfg) return null;
  const expected = process.env[cfg.env] ?? DEFAULT_AREA_PASSCODE[area as Area];
  if (!expected) return null;
  return safeEqual(passcode, expected) ? cfg.role : null;
}

function sign(data: string): string {
  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(data)
    .digest("base64url");
}

export function createAdminToken(role: Role): string {
  const data = Buffer.from(JSON.stringify({ role, exp: Date.now() + TTL_MS })).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyAdminToken(token?: string): Role | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = sign(data);
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  try {
    const { role, exp } = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof exp !== "number" || exp <= Date.now()) return null;
    return ROLES.includes(role) ? (role as Role) : null;
  } catch {
    return null;
  }
}

/** Current role from the cookie, or null. */
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

/** Any valid admin (staff or accountant). */
export async function isAdmin(): Promise<boolean> {
  return (await getRole()) !== null;
}

/** Staff-only (site settings, theme, banner). Webmaster is a superset of staff. */
export async function isStaff(): Promise<boolean> {
  const role = await getRole();
  return role === "staff" || role === "webmaster";
}

/** The site-wide media editor (replace photos/videos in place). */
export async function isWebmaster(): Promise<boolean> {
  return (await getRole()) === "webmaster";
}
export async function canEditMedia(): Promise<boolean> {
  const role = await getRole();
  return role === "webmaster" || role === "staff";
}

/** Whether the current role may manage a given area (staff and webmaster are master). */
export async function canManage(area: Area): Promise<boolean> {
  const role = await getRole();
  if (role === "webmaster") return true;
  return role !== null && AREA_ROLES[area].includes(role);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  };
}

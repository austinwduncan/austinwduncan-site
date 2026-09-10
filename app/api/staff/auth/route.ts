import { NextResponse } from "next/server";
import {
  createAdminToken,
  resolvePasscode,
  ADMIN_COOKIE,
  adminCookieOptions,
} from "@/lib/adminSession";

/*
  Unlock a staff area with its passcode. The optional `area` selects which
  passcode to check ("staff" for the dashboard, "sermons" and "audit" for the
  Manage areas); it defaults to the staff dashboard.
*/
export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 501 });
  }
  let passcode = "";
  let area = "staff";
  try {
    const body = await req.json();
    passcode = String(body.passcode ?? "");
    if (typeof body.area === "string" && body.area) area = body.area;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const role = resolvePasscode(area, passcode);
  if (!role) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(role), adminCookieOptions());
  return res;
}

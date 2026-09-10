import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminSession";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/financial-report/admin", req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

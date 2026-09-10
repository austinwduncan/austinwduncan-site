"use client";

import { useState } from "react";

/* Passcode gate for staff tools (giving editor, staff dashboard). */
export default function AdminLogin({
  endpoint = "/api/giving/auth",
  title = "Giving Editor",
  subtitle = "Enter the accountant passcode to update this week’s giving.",
  area,
}: {
  endpoint?: string;
  title?: string;
  subtitle?: string;
  area?: string;
}) {
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("checking");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passcode: fd.get("passcode"), ...(area ? { area } : {}) }),
      });
      if (res.ok) window.location.reload();
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-sm border border-white/10 bg-white/[0.03] p-10">
      <h2 className="text-center font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
        {title}
      </h2>
      <p className="mt-3 text-center text-sm text-white/60">{subtitle}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          name="passcode"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Passcode"
          className="w-full border border-white/15 bg-white/[0.05] px-4 py-3.5 text-white placeholder:text-white/40 outline-none transition-colors focus:border-secondary"
        />
        <button
          type="submit"
          disabled={status === "checking"}
          className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-ink transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "checking" ? "Checking…" : "Unlock"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-center text-sm text-red-400">Incorrect passcode.</p>
        )}
      </form>
    </div>
  );
}

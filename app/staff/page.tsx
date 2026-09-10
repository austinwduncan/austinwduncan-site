import type { Metadata } from "next";
import AdminLogin from "@/components/AdminLogin";
import StaffDashboard, { type DashGroup } from "@/components/staff/StaffDashboard";
import { isStaff } from "@/lib/adminSession";
import { getAuditLog } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff",
  robots: { index: false, follow: false },
};

const display = "font-[family-name:var(--font-display)]";

export default async function StaffPage() {
  const ok = await isStaff();
  const audit = ok ? await getAuditLog() : [];

  const groups: DashGroup[] = [
    {
      label: "Publishing",
      items: [{ id: "sermons", label: "Sermons", href: "/staff/sermons" }],
    },
    {
      label: "Activity",
      items: [
        {
          id: "audit",
          label: "Recent activity",
          panel: (
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h2 className={`${display} text-2xl text-ink`}>Recent activity</h2>
              {audit.length === 0 ? (
                <p className="mt-3 text-sm text-ink/60">Nothing recorded yet.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm text-ink/80">
                  {audit.map((a, i) => (
                    <li key={i} className="flex justify-between gap-4 border-b border-ink/10 pb-2">
                      <span>{a.action}</span>
                      <span className="shrink-0 text-ink/45">{new Date(a.created_at).toLocaleString("en-US")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className={ok ? "flex-1 bg-white" : "flex-1 bg-primary-deep"}>
      <section className="bg-primary-deep pt-40 pb-16 lg:pt-48 lg:pb-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary-soft">austinwduncan.com</p>
          <h1 className={`${display} mt-4 text-4xl tracking-wide text-white sm:text-5xl`}>Staff tools</h1>
          {ok && (
            <form action="/api/staff/logout" method="post" className="mt-6">
              <button className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white">Sign out</button>
            </form>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-14">
        {ok ? (
          <StaffDashboard groups={groups} />
        ) : (
          <AdminLogin endpoint="/api/staff/auth" area="staff" title="Staff" subtitle="Enter the staff passcode." />
        )}
      </section>
    </div>
  );
}

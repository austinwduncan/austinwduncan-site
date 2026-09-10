import { supabaseService } from "./supabase";

/** Append a staff action to the audit log (best-effort). */
export async function recordAudit(actor: string, action: string): Promise<void> {
  const db = supabaseService();
  if (!db) return;
  try {
    await db.from("audit_log").insert({ actor, action });
  } catch {
    /* ignore */
  }
}

export type AuditEntry = { actor: string; action: string; created_at: string };

export async function getAuditLog(): Promise<AuditEntry[]> {
  const db = supabaseService();
  if (!db) return [];
  try {
    const { data } = await db
      .from("audit_log")
      .select("actor,action,created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    return (data as AuditEntry[]) ?? [];
  } catch {
    return [];
  }
}

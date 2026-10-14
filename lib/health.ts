import { supabaseAdmin } from "./supabase/admin";

const DAY = 24 * 60 * 60 * 1000;
const REFRESH_WINDOW_DAYS = 7;

export interface HealthInput {
  supabaseOk: boolean;
  tokenExpiresAt: number | null;
  lastPublishAt: number | null;
  now?: number;
}

export interface HealthReport {
  ok: boolean;
  supabase: "ok" | "error";
  tokenDaysLeft: number | null;
  lastPublishAt: string | null;
  issues: string[];
}

/** Pure: turn probe results into a report + list of issues. */
export function summarizeHealth(input: HealthInput): HealthReport {
  const now = input.now ?? Date.now();
  const issues: string[] = [];

  if (!input.supabaseOk) issues.push("Supabase is unreachable");

  let tokenDaysLeft: number | null = null;
  if (input.tokenExpiresAt === null) {
    issues.push("No Instagram account connected");
  } else {
    tokenDaysLeft = Math.floor((input.tokenExpiresAt - now) / DAY);
    if (tokenDaysLeft < REFRESH_WINDOW_DAYS) {
      issues.push(`Instagram token expires in ${tokenDaysLeft} day(s)`);
    }
  }

  return {
    ok: issues.length === 0,
    supabase: input.supabaseOk ? "ok" : "error",
    tokenDaysLeft,
    lastPublishAt: input.lastPublishAt
      ? new Date(input.lastPublishAt).toISOString()
      : null,
    issues,
  };
}

/** IO: probe Supabase for reachability, token expiry, last publish. */
export async function buildHealth(): Promise<HealthReport> {
  let supabaseOk = false;
  let tokenExpiresAt: number | null = null;
  let lastPublishAt: number | null = null;

  try {
    const admin = supabaseAdmin();
    const { error } = await admin.from("connections").select("id").limit(1);
    supabaseOk = !error;

    const { data: accts } = await admin
      .from("accounts")
      .select("token_expires_at")
      .eq("platform", "instagram")
      .limit(1);
    const row = accts?.[0];
    if (row?.token_expires_at) tokenExpiresAt = Date.parse(row.token_expires_at);

    const { data: posts } = await admin
      .from("posts")
      .select("published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1);
    const p = posts?.[0];
    if (p?.published_at) lastPublishAt = Date.parse(p.published_at);
  } catch {
    supabaseOk = false;
  }

  return summarizeHealth({ supabaseOk, tokenExpiresAt, lastPublishAt });
}

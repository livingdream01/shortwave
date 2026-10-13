import { supabaseAdmin } from "../supabase/admin";
import { seal, open } from "../vault";
import { needsRefresh, refreshLongLived } from "./tokens";

export interface ResolvedToken {
  igUserId: string;
  accessToken: string;
  expiresAt: number;
  accountId: string;
}

/**
 * Resolve the Instagram token for publishing.
 * Prefers the encrypted vault (DB); falls back to env for ad-hoc CLI runs.
 */
export async function resolveInstagramToken(): Promise<ResolvedToken | null> {
  const envUser = process.env.SHORTWAVE_IG_USER_ID;
  const envToken = process.env.SHORTWAVE_IG_TOKEN;
  if (envUser && envToken) {
    return {
      igUserId: envUser,
      accessToken: envToken,
      expiresAt: Number.MAX_SAFE_INTEGER,
      accountId: "env",
    };
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("accounts")
    .select("*")
    .eq("platform", "instagram")
    .eq("status", "active")
    .order("connected_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`vault read failed: ${error.message}`);
  const row = data?.[0];
  if (!row || !row.token_ct || !row.token_iv || !row.token_tag) return null;

  const accessToken = open({
    ct: row.token_ct,
    iv: row.token_iv,
    tag: row.token_tag,
  });
  return {
    igUserId: row.external_id,
    accessToken,
    expiresAt: row.token_expires_at ? Date.parse(row.token_expires_at) : 0,
    accountId: row.id,
  };
}

/** Resolve a token, refreshing + re-sealing it first if it is near expiry. */
export async function ensureFreshInstagramToken(): Promise<ResolvedToken | null> {
  const token = await resolveInstagramToken();
  if (!token) return null;
  if (token.accountId === "env" || !needsRefresh(token.expiresAt)) return token;

  const refreshed = await refreshLongLived({
    accessToken: token.accessToken,
    userId: token.igUserId,
    expiresAt: token.expiresAt,
  });
  const sealed = seal(refreshed.accessToken);
  await supabaseAdmin()
    .from("accounts")
    .update({
      token_ct: sealed.ct,
      token_iv: sealed.iv,
      token_tag: sealed.tag,
      token_expires_at: new Date(refreshed.expiresAt).toISOString(),
      last_refreshed_at: new Date().toISOString(),
    })
    .eq("id", token.accountId);

  return { ...token, accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt };
}

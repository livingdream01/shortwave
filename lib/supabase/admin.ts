import { createClient } from "@supabase/supabase-js";
import { config } from "../config";

/**
 * Service-role Supabase client — server only. Bypasses RLS, so it is the only
 * thing that may read/write the encrypted token columns.
 */
export function supabaseAdmin() {
  const { url, serviceRoleKey } = config.supabase;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin not configured (SUPABASE_URL / SERVICE_ROLE_KEY)");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

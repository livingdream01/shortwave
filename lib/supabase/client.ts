"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (uses public env inlined at build time). */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

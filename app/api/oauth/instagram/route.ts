import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { exchangeCode, toLongLived } from "../../../../lib/publish/tokens";
import { seal } from "../../../../lib/vault";

/**
 * OAuth callback. Exchanges the code for a long-lived token, encrypts it,
 * and stores it in the owner-scoped `accounts` vault. The plaintext token
 * never touches the browser or the repo.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(error)}`, url.origin),
    );
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url.origin));

  if (!code) {
    return NextResponse.redirect(
      new URL("/api/oauth/instagram/start", url.origin),
    );
  }

  try {
    const shortTok = await exchangeCode({ code });
    const token = await toLongLived({
      shortToken: shortTok.accessToken,
      userId: shortTok.userId,
    });
    const sealed = seal(token.accessToken);
    const admin = supabaseAdmin();
    const { error: dbErr } = await admin.from("accounts").upsert(
      {
        owner_id: user.id,
        platform: "instagram",
        external_id: token.userId,
        token_ct: sealed.ct,
        token_iv: sealed.iv,
        token_tag: sealed.tag,
        token_expires_at: new Date(token.expiresAt).toISOString(),
        is_test: true,
        status: "active",
      },
      { onConflict: "owner_id,platform,external_id" },
    );
    if (dbErr) throw dbErr;
    return NextResponse.redirect(
      new URL("/connections?connected=instagram", url.origin),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(msg)}`, url.origin),
    );
  }
}

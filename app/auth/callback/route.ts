import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/connections";
  const supabase = await supabaseServer();

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as "magiclink" | "email",
        token_hash: tokenHash,
      });
      if (error) throw error;
    } else {
      throw new Error("missing auth parameters");
    }

    // Restrict the portal to the configured operator (if set).
    const operator = process.env.OPERATOR_EMAIL;
    if (operator) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.email !== operator) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL("/login?error=not_allowed", url.origin),
        );
      }
    }

    return NextResponse.redirect(new URL(next, url.origin));
  } catch {
    return NextResponse.redirect(new URL("/login?error=link", url.origin));
  }
}

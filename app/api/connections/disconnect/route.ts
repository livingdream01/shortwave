import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("accounts")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.owner_id !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const { error } = await admin
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

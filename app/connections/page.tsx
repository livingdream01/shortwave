import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";
import { DisconnectButton, SignOutButton } from "./actions";

export const dynamic = "force-dynamic";

interface Connection {
  id: string;
  platform: string;
  external_id: string;
  username: string | null;
  token_expires_at: string | null;
  is_test: boolean;
  status: string;
  connected_at: string;
}

export default async function Connections({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const { data } = await supabase
    .from("connections")
    .select("*")
    .order("connected_at", { ascending: false });
  const connections = (data ?? []) as Connection[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Signed in as {user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      {sp.connected ? (
        <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(52,211,153,0.12)" }}>
          Connected <strong>{sp.connected}</strong>.
        </div>
      ) : null}
      {sp.error ? (
        <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(248,113,113,0.12)" }}>
          Connection error: {sp.error}
        </div>
      ) : null}

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Instagram</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Tokens are encrypted at rest and never leave the server.
            </p>
          </div>
          <a
            href="/api/oauth/instagram/start"
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black"
          >
            Connect Instagram
          </a>
        </div>

        {connections.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
            No accounts linked yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {connections.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg p-3 text-sm"
                style={{ border: "1px solid var(--faint)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.platform}</span>
                    <span className="pill">{c.is_test ? "test" : "live"}</span>
                    <span className="pill">{c.status}</span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    id {c.external_id}
                    {c.token_expires_at
                      ? ` · token expires ${new Date(c.token_expires_at).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
                <DisconnectButton id={c.id} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        App ID / App Secret are deployment secrets and are never stored here.
      </p>
    </div>
  );
}

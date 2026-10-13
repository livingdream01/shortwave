"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setErr(error.message);
      else setSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-16">
      <div className="card p-8">
        <div className="eyebrow mb-2" style={{ color: "var(--muted)" }}>
          Operator access
        </div>
        <h1 className="text-2xl font-bold">Sign in to Shortwave</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Enter your email and we&rsquo;ll send a one-time sign-in link. No
          password needed.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg p-4 text-sm" style={{ background: "rgba(52,211,153,0.12)" }}>
            Link sent to <strong>{email}</strong>. Open it to sign in.
            <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
              Local dev: read the email at the Mailpit inbox —
              <a className="underline" href="http://127.0.0.1:54324" target="_blank" rel="noreferrer">
                {" "}http://127.0.0.1:54324
              </a>
              .
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg bg-white/5 px-4 py-3 text-sm outline-none"
              style={{ border: "1px solid rgba(255,255,255,0.14)" }}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send magic link"}
            </button>
            {err ? <p className="text-sm text-red-400">{err}</p> : null}
          </form>
        )}
      </div>
    </div>
  );
}

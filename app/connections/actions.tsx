"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";

export function DisconnectButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/connections/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        router.refresh();
      }}
      className="pill hover:text-red-300"
    >
      Disconnect
    </button>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
      className="text-xs hover:text-white"
      style={{ color: "var(--muted)" }}
    >
      Sign out
    </button>
  );
}

import { ensureFreshInstagramToken } from "../lib/publish/token-source";
import { notify } from "../lib/notify";

/** Refresh the Instagram long-lived token (run a couple of times a week). */
async function main() {
  const token = await ensureFreshInstagramToken();
  if (!token) {
    await notify({ level: "warn", title: "Refresh: no Instagram account connected" });
    console.log("no account connected");
    return;
  }
  const days = Math.floor((token.expiresAt - Date.now()) / 86_400_000);
  console.log(`Instagram token valid for ~${days} day(s)`);
  if (days < 7) {
    await notify({
      level: "warn",
      title: `Instagram token expires in ${days} day(s)`,
    });
  }
}

main().catch(async (e) => {
  await notify({
    level: "error",
    title: "Token refresh failed",
    detail: e instanceof Error ? e.message : String(e),
  });
  process.exit(1);
});

import { runOnce } from "./index";
import { ensureFreshInstagramToken } from "../lib/publish/token-source";
import { buildHealth } from "../lib/health";
import { notify } from "../lib/notify";

/**
 * Unattended daily sweep: refresh the token (so it never lapses from neglect),
 * publish one episode, and alert on any problem. Intended for a launchd/cron job.
 */
async function main() {
  try {
    const token = await ensureFreshInstagramToken();
    if (!token) {
      await notify({
        level: "error",
        title: "Sweep: no Instagram account connected",
        detail: "Open /connections and connect Instagram.",
      });
      console.log("no account connected — aborting sweep");
      return;
    }
  } catch (e) {
    await notify({
      level: "error",
      title: "Sweep: token refresh failed",
      detail: e instanceof Error ? e.message : String(e),
    });
    process.exit(1);
  }

  try {
    await runOnce(["--publish"]);
  } catch (e) {
    await notify({
      level: "error",
      title: "Sweep: publish run failed",
      detail: e instanceof Error ? e.message : String(e),
    });
    process.exit(1);
  }

  const health = await buildHealth();
  await notify({
    level: health.ok ? "info" : "warn",
    title: health.ok ? "Sweep complete" : `Sweep complete with issues: ${health.issues.join("; ")}`,
    detail: `token days left: ${health.tokenDaysLeft ?? "n/a"}`,
  });
  console.log("sweep done", health);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

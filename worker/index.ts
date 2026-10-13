import path from "node:path";
import { mkdir } from "node:fs/promises";
import { config, isDemo } from "../lib/config";
import { deepseek } from "../lib/agent/models";
import { mockLlm } from "../lib/agent/mock";
import { produceReel } from "../lib/agent/run";
import { renderEpisode } from "../lib/render/render";
import {
  falProvider,
  replicateProvider,
  slideshowProvider,
} from "../lib/video/providers";
import { createPublisher } from "../lib/publish/registry";
import { uploadPublic } from "../lib/storage/supabase";
import { injectCaption } from "../lib/monetize/links";
import { ensureFreshInstagramToken } from "../lib/publish/token-source";
import { appendRun } from "../lib/store";
import type { Format, Series } from "../lib/types";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : undefined;
}
const has = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const demo = has("demo") || isDemo();
  const format = (arg("format") ?? "pet_soap") as Format;

  const series: Series = {
    id: crypto.randomUUID(),
    name: arg("name") ?? "Apartment Pets",
    format,
    artStyle: "stylized 3D",
    narration: "en",
    captions: ["en", "zh"],
    voiceStyle: "narrator",
    cadencePerDay: 3,
    characterBible: [],
  };

  const outDir = path.resolve("out/renders");
  await mkdir(outDir, { recursive: true });

  console.log(`Shortwave worker — ${demo ? "DEMO" : "LIVE"} mode — format=${format}`);

  const result = await produceReel({
    series,
    trigger: has("publish") ? "manual" : "cron",
    episodeIndex: Number(arg("episode") ?? 1),
    deps: {
      llm: demo ? mockLlm() : deepseek(),
      providers: demo
        ? [slideshowProvider()]
        : [falProvider(), replicateProvider(), slideshowProvider()],
      render: renderEpisode,
      outDir,
    },
  });

  const { episode, steps, renderPath, shotErrors } = result;
  await appendRun({
    id: episode.id,
    title: episode.title,
    hook: episode.hook,
    format: series.format,
    status: episode.status,
    score: episode.score,
    steps,
    renderPath,
    createdAt: new Date().toISOString(),
  });
  console.log(`\nEpisode: ${episode.title}`);
  console.log(`Hook:    ${episode.hook}`);
  console.log(`Score:   ${episode.score}   Status: ${episode.status}`);
  console.log(`Steps:   ${steps.map((s) => s.name).join(" → ")}`);
  if (shotErrors.length) {
    console.log(`Clip fallbacks: ${shotErrors.map((e) => `${e.provider}#${e.shotIndex}`).join(", ")}`);
  }
  console.log(`Reel:    ${renderPath}`);

  if (has("publish")) {
    if (!renderPath) throw new Error("nothing to publish (no render)");
    const token = await ensureFreshInstagramToken();
    if (!token) {
      console.log(
        "\n[publish] No Instagram account connected. Open http://localhost:3040/connections and connect one (or set SHORTWAVE_IG_USER_ID/SHORTWAVE_IG_TOKEN). Skipping.",
      );
      return;
    }
    const videoUrl = await uploadPublic(renderPath, `reels/${episode.id}.mp4`);
    const caption = injectCaption(episode.caption, []);
    const publisher = createPublisher({
      platform: "instagram",
      config: { igUserId: token.igUserId, accessToken: token.accessToken },
    });
    const out = await publisher.publish({
      videoUrl,
      caption,
      isAiGenerated: true,
    });
    console.log(`\n[publish] posted → ${out.externalId} (${out.status})`);
  } else {
    console.log(`\nNext: connect Instagram at /connections and run with --publish to post.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

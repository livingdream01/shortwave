import path from "node:path";
import { mkdir } from "node:fs/promises";
import type { Episode } from "../lib/types";
import { renderEpisode, toReelProps } from "../lib/render/render";

const sample: Episode = {
  id: "smoke",
  seriesId: "s1",
  index: 1,
  title: "The Secret in Apartment 4B",
  hook: "Nobody warned Mochi…",
  script:
    "Mochi heard a noise that night. It was coming from apartment 4B. But nobody has lived there for years.",
  shots: [
    { index: 0, durationSec: 2.5, prompt: "a cat on a windowsill at night" },
    { index: 1, durationSec: 2.5, prompt: "a crack of light under a door" },
    { index: 2, durationSec: 3, prompt: "an empty apartment hallway" },
  ],
  caption: "Day 1",
  hashtags: ["#pets", "#drama"],
  status: "rendered",
  language: { narration: "en", captions: ["en", "zh"] },
};

async function main() {
  const outDir = path.resolve("out/renders");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "smoke.mp4");
  const props = toReelProps(sample);
  console.log(`Rendering ${props.shots.length} shots → ${outPath}`);
  await renderEpisode(props, outPath, (p) =>
    process.stdout.write(`\r  ${(p * 100).toFixed(0)}%`),
  );
  process.stdout.write("\n");
  console.log(`Done: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

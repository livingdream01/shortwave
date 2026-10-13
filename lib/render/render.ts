import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { Episode } from "../types";
import type { ReelProps, ReelShot } from "../../remotion/ReelVideo";
import { chunkCues } from "../video/captions";

const here = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(here, "../../remotion/index.ts");

export interface ToReelOptions {
  brand?: string;
  /** Optional per-shot clip URLs (from the video providers). */
  clipUrls?: (string | undefined)[];
}

/** Pure mapping episode -> Remotion props (unit-tested). */
export function toReelProps(episode: Episode, opts: ToReelOptions = {}): ReelProps {
  const totalSec = episode.shots.reduce((n, s) => n + s.durationSec, 0);
  const cues = chunkCues(episode.script, totalSec, 18);
  const shots: ReelShot[] = episode.shots.map((shot, i) => {
    const cue = cues.length > 0 ? cues[i % cues.length]! : undefined;
    return {
      narration: episode.script,
      caption: cue?.text ?? shot.prompt.slice(0, 40),
      durationSec: shot.durationSec,
      videoUrl: opts.clipUrls?.[i],
    };
  });
  return {
    title: episode.title,
    hook: episode.hook,
    brand: opts.brand ?? "SHORTWAVE",
    shots,
  };
}

/** Render an episode to an MP4 file. Returns the output path. */
export async function renderEpisode(
  props: ReelProps,
  outPath: string,
  onProgress?: (p: number) => void,
): Promise<string> {
  const serveUrl = await bundle({ entryPoint: ENTRY });
  const inputProps = props as unknown as Record<string, unknown>;
  const composition = await selectComposition({
    serveUrl,
    id: "Reel",
    inputProps,
  });
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outPath,
    inputProps,
    onProgress: ({ progress }) => onProgress?.(progress),
  });
  return outPath;
}

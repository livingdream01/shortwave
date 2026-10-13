import path from "node:path";
import type { AgentStep, Arm, Episode, Series } from "../types";
import type { Llm } from "./models";
import { runPipeline } from "./pipeline";
import { toReelProps } from "../render/render";
import type { ReelProps } from "../../remotion/ReelVideo";
import { generateWithFallback, type VideoProvider } from "../video/providers";

export interface ProduceDeps {
  llm: Llm;
  providers: VideoProvider[];
  render: (props: ReelProps, outPath: string) => Promise<string>;
  outDir: string;
}

export interface ProduceInput {
  series: Series;
  trigger: string;
  episodeIndex?: number;
  recap?: string;
  arm?: Arm;
  deps: ProduceDeps;
}

export interface ProduceResult {
  episode: Episode;
  steps: AgentStep[];
  reelProps: ReelProps;
  renderPath?: string;
  shotErrors: { provider: string; shotIndex: number }[];
}

/**
 * Full produce loop: write → critic → generate clips (with fallback) →
 * assemble → render. Rendering is injected so it can be faked in tests.
 */
export async function produceReel(input: ProduceInput): Promise<ProduceResult> {
  const { series, trigger, arm, deps } = input;

  const { episode, steps } = await runPipeline({
    series,
    trigger,
    episodeIndex: input.episodeIndex,
    recap: input.recap,
    arm,
    deps: { llm: deps.llm },
  });

  const shotErrors: ProduceResult["shotErrors"] = [];
  const clips = await Promise.all(
    episode.shots.map((shot) =>
      generateWithFallback(deps.providers, shot, (provider) =>
        shotErrors.push({ provider, shotIndex: shot.index }),
      ),
    ),
  );

  const reelProps = toReelProps(episode, {
    clipUrls: clips.map((c) => c.url),
  });

  // DIRECTOR — owns the provider plan (deterministic routing, recorded here).
  steps.push({
    name: "director",
    model: "service",
    status: "done",
    input: `${episode.shots.length} shots`,
    output: clips.map((c) => `${c.provider}:${c.model}`).join(", "),
    tokens: 0,
    costUsd: 0,
  });

  let renderPath: string | undefined;
  if (episode.status !== "failed") {
    const outPath = path.join(deps.outDir, `${episode.id}.mp4`);
    renderPath = await deps.render(reelProps, outPath);
    episode.renderPath = renderPath;
    episode.status = "rendered";
  }

  return { episode, steps, reelProps, renderPath, shotErrors };
}

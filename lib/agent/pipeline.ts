import type { AgentStep, Arm, Character, Episode, Series } from "../types";
import { formatPlaybook } from "./niches";
import type { Llm } from "./models";
import { parseJson } from "./models";
import {
  criticMessages,
  lengthSeconds,
  scoutMessages,
  writerMessages,
  type Critique,
  type DraftEpisode,
} from "./prompts";

export const MAX_REWRITES = 3;

export interface PipelineDeps {
  llm: Llm;
  modelFast?: string;
  modelThink?: string;
}

export interface RunPipelineInput {
  series: Series;
  trigger: string;
  episodeIndex?: number;
  recap?: string;
  arm?: Arm;
  deps: PipelineDeps;
}

export interface PipelineResult {
  episode: Episode;
  steps: AgentStep[];
  totalTokens: number;
  totalCostUsd: number;
}

const preview = (s: string, n = 280) =>
  s.length > n ? `${s.slice(0, n)}…` : s;

/** Derive a consistent cast for a series from its format playbook. */
export function buildCharacterBible(series: Series): Character[] {
  if (series.characterBible.length > 0) return series.characterBible;
  const p = formatPlaybook(series.format);
  return p.cast.map((c) => ({
    name: c.name,
    role: c.role,
    personality: c.role,
    appearancePrompt: `${p.visualStyle}; character ${c.name} — ${c.role}`,
    refImagePrompt: `${p.visualStyle}, character reference sheet for ${c.name}, ${c.role}`,
  }));
}

export async function runPipeline(
  input: RunPipelineInput,
): Promise<PipelineResult> {
  const { series, episodeIndex = 1, recap = "", arm, deps } = input;
  const modelFast = deps.modelFast ?? "deepseek-chat";
  const modelThink = deps.modelThink ?? "deepseek-reasoner";
  const target = lengthSeconds(arm?.length ?? "medium");
  const steps: AgentStep[] = [];
  let totalTokens = 0;
  let totalCostUsd = 0;

  const record = (
    name: string,
    model: string,
    status: AgentStep["status"],
    inputText: string,
    outputText: string,
    tokens: number,
    costUsd: number,
  ) => {
    steps.push({
      name,
      model,
      status,
      input: preview(inputText),
      output: preview(outputText),
      tokens,
      costUsd,
    });
    totalTokens += tokens;
    totalCostUsd += costUsd;
  };

  const cast: Series = {
    ...series,
    characterBible: buildCharacterBible(series),
  };

  // 1. SCOUT — owns the trend brief.
  const scout = await deps.llm.chat(modelFast, scoutMessages(cast), {
    json: true,
  });
  record("scout", modelFast, "done", "trend scout", scout.text, scout.tokens, scout.costUsd);

  // 1b. CHARACTER BIBLE — owns the cast canon (deterministic, no LLM tokens).
  record(
    "character-bible",
    "service",
    "done",
    "series + playbook",
    cast.characterBible.map((c) => c.name).join(", "),
    0,
    0,
  );

  // 2. WRITE + CRITIQUE (bounded loop)
  let draft: DraftEpisode | null = null;
  let critique: Critique | null = null;
  let feedback = recap;

  for (let attempt = 0; attempt <= MAX_REWRITES; attempt++) {
    const w = await deps.llm.chat(
      modelFast,
      writerMessages(cast, episodeIndex, feedback, target),
      { json: true },
    );
    record(
      "write",
      modelFast,
      "done",
      `episode #${episodeIndex} attempt ${attempt + 1}`,
      w.text,
      w.tokens,
      w.costUsd,
    );
    draft = parseJson<DraftEpisode>(w.text);

    const c = await deps.llm.chat(modelThink, criticMessages(cast, draft), {
      json: true,
    });
    critique = parseJson<Critique>(c.text);
    const passed = critique.pass && (critique.violations?.length ?? 0) === 0;
    record(
      "critique",
      modelThink,
      passed ? "done" : "rejected",
      JSON.stringify(draft).slice(0, 200),
      c.text,
      c.tokens,
      c.costUsd,
    );
    if (passed) break;
    feedback = `Previous draft was rejected. Fix: ${critique.reasons.join("; ")}`;
  }

  if (!draft || !critique) throw new Error("pipeline produced no draft");

  // 1c. STORYBOARD — owns the timed shot list (deterministic, no LLM tokens).
  record(
    "storyboard",
    "service",
    "done",
    "episode shots",
    draft.shots.map((s) => `${s.durationSec}s`).join(" + "),
    0,
    0,
  );

  const passed = critique.pass && (critique.violations?.length ?? 0) === 0;
  const episode: Episode = {
    id: crypto.randomUUID(),
    seriesId: series.id,
    index: episodeIndex,
    title: draft.title,
    hook: draft.hook,
    script: draft.script,
    shots: draft.shots.map((s, i) => ({ ...s, index: i })),
    caption: draft.caption,
    hashtags: draft.hashtags ?? [],
    status: passed ? "written" : "failed",
    score: critique.score,
    language: { narration: series.narration, captions: series.captions },
  };

  return { episode, steps, totalTokens, totalCostUsd };
}

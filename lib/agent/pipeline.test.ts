import { describe, it, expect } from "vitest";
import { runPipeline, buildCharacterBible, MAX_REWRITES } from "./pipeline";
import type { Llm } from "./models";
import type { Critique } from "./prompts";
import type { Series } from "../types";

const series: Series = {
  id: "s1",
  name: "Apartment Pets",
  format: "pet_soap",
  artStyle: "stylized 3D",
  narration: "en",
  captions: ["en", "zh"],
  voiceStyle: "narrator",
  cadencePerDay: 3,
  characterBible: [],
};

const DRAFT = {
  title: "The Secret",
  hook: "Nobody warned Mochi…",
  script: "Mochi heard a noise.",
  shots: [
    { index: 0, durationSec: 3, prompt: "cat on a windowsill", camera: "slow push" },
    { index: 1, durationSec: 4, prompt: "dog looks up", camera: "static" },
  ],
  caption: "Day 1",
  hashtags: ["#pets"],
};

function fakeLlm(critiqueSeq: Critique[]): Llm {
  let ci = 0;
  return {
    async chat(_model, messages) {
      const sys = messages[0]!.content;
      const box = (obj: unknown) => ({
        text: JSON.stringify(obj),
        tokens: 1,
        costUsd: 0,
      });
      if (sys.includes("trend scout")) {
        return box({ angles: [], sounds: [], keywords: [] });
      }
      if (sys.includes("drama writer")) return box(DRAFT);
      if (sys.includes("critic")) {
        const c = critiqueSeq[Math.min(ci, critiqueSeq.length - 1)]!;
        ci++;
        return box(c);
      }
      throw new Error(`unexpected role: ${sys.slice(0, 40)}`);
    },
  };
}

const pass: Critique = { score: 8, pass: true, reasons: [], violations: [] };
const reject: Critique = {
  score: 4,
  pass: false,
  reasons: ["weak hook"],
  violations: [],
};

describe("buildCharacterBible", () => {
  it("is deterministic across episodes", () => {
    const a = buildCharacterBible(series);
    const b = buildCharacterBible(series);
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((c) => c.appearancePrompt)).toEqual(
      b.map((c) => c.appearancePrompt),
    );
  });

  it("respects an existing cast", () => {
    const existing: Series = {
      ...series,
      characterBible: [
        {
          name: "Zed",
          role: "hero",
          personality: "brave",
          appearancePrompt: "fixed look",
          refImagePrompt: "ref",
        },
      ],
    };
    expect(buildCharacterBible(existing)[0]!.name).toBe("Zed");
  });
});

describe("runPipeline", () => {
  it("rewrites on rejection then approves, tracing every step", async () => {
    const { episode, steps, totalTokens } = await runPipeline({
      series,
      trigger: "manual",
      deps: { llm: fakeLlm([reject, reject, pass]) },
    });

    expect(episode.status).toBe("written");
    expect(episode.shots[0]!.index).toBe(0);
    const writes = steps.filter((s) => s.name === "write");
    expect(writes).toHaveLength(3);
    expect(steps[0]!.name).toBe("scout");
    // Service stages (character-bible, storyboard) add no LLM tokens.
    expect(steps.map((s) => s.name)).toContain("character-bible");
    expect(steps.map((s) => s.name)).toContain("storyboard");
    expect(totalTokens).toBe(steps.filter((s) => s.tokens > 0).length);
  });

  it("marks the episode failed after exhausting rewrites", async () => {
    const { episode, steps } = await runPipeline({
      series,
      trigger: "cron",
      deps: { llm: fakeLlm([reject]) },
    });
    expect(episode.status).toBe("failed");
    expect(steps.filter((s) => s.name === "write")).toHaveLength(
      MAX_REWRITES + 1,
    );
  });
});

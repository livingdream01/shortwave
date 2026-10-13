import type { Character, Lang, Series, ShotSpec } from "../types";
import { formatPlaybook } from "./niches";
import type { LlmMessage } from "./models";

export const POLICY_RULES = [
  "Original characters and stories only — never adapt copyrighted works or reuse real people's likeness.",
  "No photorealistic depiction of real, identifiable people.",
  "Depict fiction clearly; content will be labelled as AI-generated.",
  "No gore, sexual content, hate, harassment, or promotion of self-harm.",
  "No medical, financial, or safety misinformation.",
];

export interface DraftEpisode {
  title: string;
  hook: string;
  script: string;
  shots: ShotSpec[];
  caption: string;
  hashtags: string[];
}

export interface Critique {
  score: number;
  pass: boolean;
  reasons: string[];
  violations: string[];
}

const LENGTH_SECONDS: Record<string, number> = {
  short: 20,
  medium: 35,
  long: 55,
};

function castBlock(cast: Character[]): string {
  if (cast.length === 0) return "Cast: a single narrator voice.";
  return (
    "Recurring cast (keep appearance identical across episodes):\n" +
    cast
      .map(
        (c) =>
          `- ${c.name} (${c.role}): ${c.personality}. Appearance: ${c.appearancePrompt}`,
      )
      .join("\n")
  );
}

export function scoutMessages(series: Series): LlmMessage[] {
  const p = formatPlaybook(series.format);
  return [
    {
      role: "system",
      content:
        "You are a short-form trend scout for a global English-speaking audience. " +
        "You know what hooks make people stop scrolling in the first 3 seconds. Return JSON.",
    },
    {
      role: "user",
      content:
        `Format: ${p.title} — ${p.premise}\n` +
        `Tone: ${p.tone}\nHook patterns seen in the wild: ${p.hookPatterns.join(" | ")}\n\n` +
        `Return JSON {"angles": string[5], "sounds": string[3], "keywords": string[8]} ` +
        `with fresh angles for this format this week.`,
    },
  ];
}

export function writerMessages(
  series: Series,
  episodeIndex: number,
  recap: string,
  targetSeconds: number,
): LlmMessage[] {
  const p = formatPlaybook(series.format);
  return [
    {
      role: "system",
      content:
        "You are a master short-form drama writer. You write original, punchy vertical " +
        "episodes with a scroll-stopping 0-3s hook, escalating beats, and a cliffhanger. " +
        `Language: narration in ${series.narration}, captions in ${series.captions.join(", ")}. ` +
        "Return strict JSON only.",
    },
    {
      role: "user",
      content:
        `Series: ${series.name}\nFormat: ${p.title} — ${p.premise}\nTone: ${p.tone}\n` +
        `Visual style: ${p.visualStyle}\nBeats: ${p.beats.join(" -> ")}\n` +
        `${castBlock(series.characterBible)}\n\n` +
        (recap ? `Previously in the series: ${recap}\n\n` : "") +
        `Write episode #${episodeIndex}. Total runtime about ${targetSeconds}s across 3-6 shots.\n` +
        `Return JSON with this exact shape:\n` +
        `{"title":string,"hook":string,"script":string,` +
        `"shots":[{"index":number,"durationSec":number,"prompt":string,"camera":string}],` +
        `"caption":string,"hashtags":string[]}\n` +
        `"script" is the full spoken narration (English). "shots[].prompt" is a text-to-video ` +
        `prompt in English, never naming real people. End with a soft CTA: "${p.cta}".`,
    },
  ];
}

export function criticMessages(
  series: Series,
  draft: DraftEpisode,
): LlmMessage[] {
  const p = formatPlaybook(series.format);
  return [
    {
      role: "system",
      content:
        "You are a ruthless short-form virality and brand-safety critic. Score 0-10 and " +
        "reject drafts that are generic, slow, unclear, or violate policy. Return strict JSON.",
    },
    {
      role: "user",
      content:
        `Format: ${p.title}. Policy rules:\n` +
        POLICY_RULES.map((r, i) => `${i + 1}. ${r}`).join("\n") +
        `\n\nDraft:\n${JSON.stringify(draft)}\n\n` +
        `Return JSON {"score":number,"pass":boolean,"reasons":string[],"violations":string[]}. ` +
        `"pass" is true only if score >= 7 and there are no policy violations.`,
    },
  ];
}

export function translateMessages(text: string, target: Lang): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `Translate the user's text into ${target === "zh" ? "Simplified Chinese" : "English"}. ` +
        "Keep it punchy and colloquial for captions. Return JSON {\"text\": string}.",
    },
    { role: "user", content: text },
  ];
}

export function lengthSeconds(bucket: string): number {
  return LENGTH_SECONDS[bucket] ?? 35;
}

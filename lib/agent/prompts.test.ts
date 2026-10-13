import { describe, it, expect } from "vitest";
import {
  writerMessages,
  criticMessages,
  translateMessages,
  scoutMessages,
  lengthSeconds,
  POLICY_RULES,
} from "./prompts";
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

describe("prompt builders", () => {
  it("writer prompt carries the format, language pair and cast block", () => {
    const text = writerMessages(series, 2, "recap", 35)
      .map((m) => m.content)
      .join("\n");
    expect(text).toContain("Pet Micro-Soap");
    expect(text.toLowerCase()).toContain("english");
    expect(text).toContain("episode #2");
  });

  it("critic prompt embeds every policy rule", () => {
    const text = criticMessages(series, {
      title: "t",
      hook: "h",
      script: "s",
      shots: [],
      caption: "c",
      hashtags: [],
    })
      .map((m) => m.content)
      .join("\n");
    for (const rule of POLICY_RULES) expect(text).toContain(rule.slice(0, 20));
  });

  it("scout and translate prompts are well-formed", () => {
    expect(scoutMessages(series)[0]!.role).toBe("system");
    const tr = translateMessages("hello", "zh")
      .map((m) => m.content)
      .join(" ");
    expect(tr).toContain("Chinese");
  });

  it("maps length buckets with a safe default", () => {
    expect(lengthSeconds("short")).toBe(20);
    expect(lengthSeconds("medium")).toBe(35);
    expect(lengthSeconds("long")).toBe(55);
    expect(lengthSeconds("???")).toBe(35);
  });
});

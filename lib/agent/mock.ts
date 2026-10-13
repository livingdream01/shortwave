import type { Llm } from "./models";

/** Offline, deterministic stand-in for DeepSeek so demo runs need no keys. */
export function mockLlm(): Llm {
  return {
    async chat(_model, messages) {
      const sys = messages[0]?.content ?? "";
      const box = (obj: unknown) => ({
        text: JSON.stringify(obj),
        tokens: 42,
        costUsd: 0,
      });
      if (sys.includes("trend scout")) {
        return box({
          angles: ["secret neighbour", "missing pet", "returned letter"],
          sounds: ["soft piano", "lo-fi tension"],
          keywords: ["pets", "drama", "story"],
        });
      }
      if (sys.includes("drama writer")) {
        return box({
          title: "The Secret in Apartment 4B",
          hook: "Nobody warned Mochi…",
          script:
            "Mochi heard a noise that night. It was coming from apartment 4B. But nobody has lived there for years.",
          shots: [
            { index: 0, durationSec: 2.5, prompt: "a cat on a windowsill at night", camera: "slow push" },
            { index: 1, durationSec: 2.5, prompt: "a crack of light under a door", camera: "static" },
            { index: 2, durationSec: 3, prompt: "an empty apartment hallway", camera: "dolly" },
          ],
          caption: "Day 1 — Apartment 4B. 👀",
          hashtags: ["#pets", "#drama", "#storytime", "#aishorts"],
        });
      }
      if (sys.includes("critic")) {
        return box({ score: 8, pass: true, reasons: ["strong hook"], violations: [] });
      }
      if (sys.includes("Translate")) {
        return box({ text: "第一天 — 四號公寓。" });
      }
      return box({});
    },
  };
}

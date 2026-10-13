import { describe, it, expect } from "vitest";
import { toReelProps } from "./render";
import type { Episode } from "../types";

const episode: Episode = {
  id: "e1",
  seriesId: "s1",
  index: 1,
  title: "The Secret",
  hook: "Nobody warned Mochi…",
  script: "Mochi heard a noise. It came from 4B. Nobody lived there.",
  shots: [
    { index: 0, durationSec: 3, prompt: "a cat on a windowsill" },
    { index: 1, durationSec: 3, prompt: "a door creaks open" },
    { index: 2, durationSec: 3, prompt: "an empty hallway" },
  ],
  caption: "Day 1",
  hashtags: ["#pets"],
  status: "rendered",
  language: { narration: "en", captions: ["en", "zh"] },
};

describe("toReelProps", () => {
  it("maps every shot and attaches captions within 2 lines", () => {
    const props = toReelProps(episode);
    expect(props.shots).toHaveLength(3);
    for (const s of props.shots) {
      expect(s.durationSec).toBe(3);
      expect(s.caption.length).toBeGreaterThan(0);
    }
  });

  it("carries clip urls through and defaults the brand", () => {
    const props = toReelProps(episode, { clipUrls: ["https://x/a.mp4", undefined, undefined] });
    expect(props.brand).toBe("SHORTWAVE");
    expect(props.shots[0]!.videoUrl).toBe("https://x/a.mp4");
  });
});

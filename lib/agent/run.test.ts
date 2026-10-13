import { describe, it, expect } from "vitest";
import { produceReel } from "./run";
import { mockLlm } from "./mock";
import { slideshowProvider, type VideoProvider } from "../video/providers";
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

const fakeRender = async (_props: unknown, outPath: string) => outPath;

describe("produceReel", () => {
  it("produces a rendered episode end-to-end with mocked deps", async () => {
    const result = await produceReel({
      series,
      trigger: "manual",
      deps: {
        llm: mockLlm(),
        providers: [slideshowProvider()],
        render: fakeRender,
        outDir: "/tmp/sw",
      },
    });
    expect(result.episode.status).toBe("rendered");
    expect(result.renderPath).toContain(result.episode.id);
    expect(result.reelProps.shots).toHaveLength(3);
    expect(result.steps[0]!.name).toBe("scout");
  });

  it("records a fallback when a provider fails", async () => {
    const boom: VideoProvider = {
      name: "fal",
      async generate() {
        throw new Error("down");
      },
    };
    const result = await produceReel({
      series,
      trigger: "cron",
      deps: {
        llm: mockLlm(),
        providers: [boom, slideshowProvider()],
        render: fakeRender,
        outDir: "/tmp/sw",
      },
    });
    expect(result.shotErrors.length).toBe(3);
    expect(result.shotErrors[0]!.provider).toBe("fal");
  });
});

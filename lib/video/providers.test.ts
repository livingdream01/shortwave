import { describe, it, expect } from "vitest";
import {
  registry,
  generateWithFallback,
  slideshowProvider,
  type VideoProvider,
} from "./providers";
import type { ShotSpec } from "../types";

const shot: ShotSpec = { index: 0, durationSec: 4, prompt: "a cat" };

const ok = (name: string): VideoProvider => ({
  name,
  async generate(s) {
    return { shotIndex: s.index, provider: name, model: "m", durationSec: s.durationSec, url: "u" };
  },
});

const boom = (name: string): VideoProvider => ({
  name,
  async generate() {
    throw new Error(`${name} down`);
  },
});

describe("registry", () => {
  it("gets a provider by name", () => {
    const r = registry(ok("fal"), ok("replicate"));
    expect(r.get("fal").name).toBe("fal");
    expect(r.names()).toEqual(["fal", "replicate"]);
  });
  it("throws for an unknown provider", () => {
    expect(() => registry().get("x")).toThrow();
  });
});

describe("generateWithFallback (Review Focus #3)", () => {
  it("uses the first working provider", async () => {
    const asset = await generateWithFallback([ok("fal"), ok("replicate")], shot);
    expect(asset.provider).toBe("fal");
  });

  it("falls through a failing provider to the next", async () => {
    const errors: string[] = [];
    const asset = await generateWithFallback(
      [boom("fal"), ok("replicate")],
      shot,
      (name) => errors.push(name),
    );
    expect(asset.provider).toBe("replicate");
    expect(errors).toEqual(["fal"]);
  });

  it("drops to slideshow when all providers fail", async () => {
    const asset = await generateWithFallback([boom("fal"), boom("replicate")], shot);
    expect(asset.provider).toBe("slideshow");
  });
});

describe("slideshowProvider", () => {
  it("always succeeds", async () => {
    const asset = await slideshowProvider().generate(shot);
    expect(asset.failed).toBeFalsy();
  });
});

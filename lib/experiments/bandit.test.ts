import { describe, it, expect } from "vitest";
import { chooseArm, update, betaSample, reward } from "./bandit";

describe("chooseArm", () => {
  it("works with a uniform prior at cold start (Review Focus #5)", () => {
    const posteriors = {
      a: { alpha: 1, beta: 1 },
      b: { alpha: 1, beta: 1 },
    };
    const pick = chooseArm(posteriors);
    expect(["a", "b"]).toContain(pick);
  });

  it("throws with no arms", () => {
    expect(() => chooseArm({})).toThrow();
  });

  it("converges on a clearly winning arm", () => {
    const posteriors = {
      winner: { alpha: 80, beta: 2 },
      a: { alpha: 1, beta: 1 },
      b: { alpha: 1, beta: 1 },
    };
    let wins = 0;
    for (let i = 0; i < 1000; i++) {
      if (chooseArm(posteriors) === "winner") wins++;
    }
    expect(wins).toBeGreaterThan(600);
  });
});

describe("update", () => {
  it("clamps the reward to [0,1]", () => {
    expect(update({ alpha: 1, beta: 1 }, 5)).toEqual({ alpha: 2, beta: 1 });
    expect(update({ alpha: 1, beta: 1 }, -3)).toEqual({ alpha: 1, beta: 2 });
  });
});

describe("betaSample", () => {
  it("stays in [0,1]", () => {
    for (let i = 0; i < 100; i++) {
      const s = betaSample(2, 2);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});

describe("reward", () => {
  it("is higher for a retained, shared video", () => {
    const good = reward({
      retention3s: 0.9,
      avgWatchPct: 0.8,
      completion: 0.6,
      shares: 100,
      saves: 100,
      plays: 1000,
    });
    const bad = reward({
      retention3s: 0.1,
      avgWatchPct: 0.1,
      completion: 0.05,
      shares: 0,
      saves: 0,
      plays: 1000,
    });
    expect(good).toBeGreaterThan(bad);
    expect(good).toBeLessThanOrEqual(1);
    expect(bad).toBeGreaterThanOrEqual(0);
  });
});

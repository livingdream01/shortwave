import { describe, it, expect } from "vitest";
import { FORMATS, ALL_FORMATS, formatPlaybook } from "./niches";

describe("format playbooks", () => {
  it("defines five formats", () => {
    expect(ALL_FORMATS).toHaveLength(5);
    expect(Object.keys(FORMATS)).toHaveLength(5);
  });

  it("every playbook is complete", () => {
    for (const f of ALL_FORMATS) {
      const p = formatPlaybook(f);
      expect(p.key).toBe(f);
      expect(p.premise.length).toBeGreaterThan(0);
      expect(p.cast.length).toBeGreaterThan(0);
      expect(p.hookPatterns.length).toBeGreaterThan(0);
      expect(p.beats.length).toBeGreaterThan(0);
      expect(p.cta.length).toBeGreaterThan(0);
    }
  });

  it("rejects an unknown format", () => {
    // @ts-expect-error deliberately invalid
    expect(() => formatPlaybook("nope")).toThrow();
  });
});

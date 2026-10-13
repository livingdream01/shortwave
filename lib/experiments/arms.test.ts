import { describe, it, expect } from "vitest";
import { allArms, armKey, parseArmKey, allArmKeys } from "./arms";

describe("arm space", () => {
  it("is the full cross-product (5×5×3×3×3 = 675)", () => {
    expect(allArms()).toHaveLength(675);
    expect(new Set(allArmKeys()).size).toBe(675);
  });

  it("round-trips through armKey/parseArmKey", () => {
    const arm = allArms()[0]!;
    expect(parseArmKey(armKey(arm))).toEqual(arm);
  });

  it("rejects malformed keys", () => {
    expect(() => parseArmKey("pet_soap|question")).toThrow();
  });
});

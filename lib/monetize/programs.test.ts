import { describe, it, expect } from "vitest";
import { PROGRAMS, program } from "./programs";

describe("affiliate programs", () => {
  it("exposes the known programs", () => {
    expect(PROGRAMS.map((p) => p.id)).toEqual(
      expect.arrayContaining(["facelessreels", "openart", "oakgen"]),
    );
  });

  it("facelessreels is recurring and bans self-referral", () => {
    const p = program("facelessreels");
    expect(p.recurring).toBe(true);
    expect(p.allowSelfReferral).toBe(false);
    expect(p.requiresDisclosure).toBe(true);
  });

  it("throws for an unknown program", () => {
    expect(() => program("nope")).toThrow();
  });
});

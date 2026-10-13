import { describe, it, expect } from "vitest";
import { trackedLink, injectCaption, DISCLOSURE } from "./links";

const spec = {
  programId: "facelessreels",
  label: "FacelessReels",
  targetUrl: "https://facelessreels.com",
  campaign: "pet-soap",
  ref: "sw-123",
};

describe("trackedLink", () => {
  it("adds UTM params and the referral id", () => {
    const url = new URL(trackedLink(spec));
    expect(url.searchParams.get("utm_source")).toBe("shortwave");
    expect(url.searchParams.get("utm_campaign")).toBe("pet-soap");
    expect(url.searchParams.get("ref")).toBe("sw-123");
  });

  it("throws for an unknown program", () => {
    expect(() => trackedLink({ ...spec, programId: "nope" })).toThrow();
  });
});

describe("injectCaption", () => {
  it("returns the caption unchanged when there are no links", () => {
    expect(injectCaption("hello world", [])).toBe("hello world");
  });

  it("appends links and the disclosure", () => {
    const out = injectCaption("Day 1", [spec]);
    expect(out).toContain("Day 1");
    expect(out).toContain("utm_source=shortwave");
    expect(out).toContain(DISCLOSURE);
  });
});

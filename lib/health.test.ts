import { describe, it, expect } from "vitest";
import { summarizeHealth } from "./health";

const DAY = 24 * 60 * 60 * 1000;
const now = 1_000_000_000_000;

describe("summarizeHealth", () => {
  it("is ok when Supabase is up and the token is fresh", () => {
    const r = summarizeHealth({
      supabaseOk: true,
      tokenExpiresAt: now + 30 * DAY,
      lastPublishAt: now - DAY,
      now,
    });
    expect(r.ok).toBe(true);
    expect(r.tokenDaysLeft).toBe(30);
    expect(r.issues).toEqual([]);
  });

  it("flags an unreachable Supabase", () => {
    const r = summarizeHealth({
      supabaseOk: false,
      tokenExpiresAt: now + 30 * DAY,
      lastPublishAt: null,
      now,
    });
    expect(r.ok).toBe(false);
    expect(r.issues).toContain("Supabase is unreachable");
  });

  it("flags a missing connection", () => {
    const r = summarizeHealth({
      supabaseOk: true,
      tokenExpiresAt: null,
      lastPublishAt: null,
      now,
    });
    expect(r.issues).toContain("No Instagram account connected");
  });

  it("flags a token inside the refresh window", () => {
    const r = summarizeHealth({
      supabaseOk: true,
      tokenExpiresAt: now + 3 * DAY,
      lastPublishAt: null,
      now,
    });
    expect(r.ok).toBe(false);
    expect(r.issues[0]).toMatch(/expires in 3 day/);
  });
});

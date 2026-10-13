import { describe, it, expect, vi } from "vitest";
import { needsRefresh, assertUsable, exchangeCode, toLongLived } from "./tokens";

const DAY = 24 * 60 * 60 * 1000;
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status });

describe("needsRefresh", () => {
  it("is true within the 7-day window", () => {
    expect(needsRefresh(Date.now() + 3 * DAY)).toBe(true);
  });
  it("is false well before expiry", () => {
    expect(needsRefresh(Date.now() + 30 * DAY)).toBe(false);
  });
});

describe("assertUsable (Review Focus #2)", () => {
  it("throws loudly for an expired token", () => {
    const now = 1_000_000;
    expect(() =>
      assertUsable(
        { accessToken: "t", userId: "42", expiresAt: now - 1 },
        now,
      ),
    ).toThrow(/expired/);
  });
  it("passes a live token", () => {
    const now = 1_000_000;
    expect(() =>
      assertUsable(
        { accessToken: "t", userId: "42", expiresAt: now + DAY },
        now,
      ),
    ).not.toThrow();
  });
});

describe("exchangeCode", () => {
  it("posts form-encoded and returns the token + user", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input, init) => {
      const body = String((init as RequestInit).body);
      expect(body).toContain("code=abc");
      expect(body).toContain("grant_type=authorization_code");
      return json({ access_token: "short", user_id: 99 });
    });
    const out = await exchangeCode({
      code: "abc",
      appId: "app",
      appSecret: "secret",
      fetchImpl,
    });
    expect(out).toEqual({ accessToken: "short", userId: "99" });
  });
});

describe("toLongLived", () => {
  it("computes an expiry from expires_in", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      json({ access_token: "long", expires_in: 60 * 24 * 60 * 60 }),
    );
    const tok = await toLongLived({
      shortToken: "short",
      userId: "99",
      appSecret: "secret",
      fetchImpl,
    });
    expect(tok.accessToken).toBe("long");
    expect(tok.expiresAt).toBeGreaterThan(Date.now() + 50 * DAY);
  });
});

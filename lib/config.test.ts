import { describe, it, expect } from "vitest";
import { config, isDemo } from "./config";

describe("config", () => {
  it("provides sensible defaults", () => {
    expect(config.deepseek.baseUrl).toMatch(/^https:\/\//);
    expect(config.instagram.apiVersion).toMatch(/^v\d+/);
    expect(config.instagram.redirectUri).toContain("/api/oauth/instagram");
  });

  it("reports demo mode as a boolean", () => {
    expect(typeof isDemo()).toBe("boolean");
  });
});

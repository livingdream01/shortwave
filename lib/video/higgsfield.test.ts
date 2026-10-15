import { describe, it, expect, vi } from "vitest";
import { higgsfieldProvider, extractOutputUrl } from "./higgsfield";
import type { ShotSpec } from "../types";

const shot: ShotSpec = { index: 0, durationSec: 4, prompt: "a cat on a windowsill" };

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status });

describe("extractOutputUrl", () => {
  it("finds urls across payload shapes", () => {
    expect(extractOutputUrl({ result: { url: "a" } })).toBe("a");
    expect(extractOutputUrl({ output: { url: "b" } })).toBe("b");
    expect(extractOutputUrl({ results: [{ url: "c" }] })).toBe("c");
    expect(extractOutputUrl({ status: "completed" })).toBeUndefined();
  });
});

describe("higgsfieldProvider", () => {
  it("submits, polls, and returns the clip url", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      calls.push(url);
      if (init?.method === "POST") {
        return json({ request_id: "req1", status_url: "https://api.higgsfield.ai/requests/req1/status" });
      }
      return json({ status: "completed", result: { url: "https://cdn.hf/clip.mp4" } });
    });

    const provider = higgsfieldProvider({
      keyId: "id",
      keySecret: "secret",
      fetchImpl,
      sleep: async () => {},
    });
    const asset = await provider.generate(shot);

    expect(asset.provider).toBe("higgsfield");
    expect(asset.url).toBe("https://cdn.hf/clip.mp4");
    expect(calls[0]).toContain("/higgsfield-ai/dop/standard");
    // auth header uses the "Key id:secret" scheme
    const headers = fetchImpl.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Key id:secret");
  });

  it("throws when the request fails", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (_i, init) =>
      init?.method === "POST"
        ? json({ request_id: "r", status_url: "s" })
        : json({ status: "failed" }),
    );
    await expect(
      higgsfieldProvider({ keyId: "i", keySecret: "s", fetchImpl, sleep: async () => {} }).generate(shot),
    ).rejects.toThrow(/failed/);
  });

  it("throws without credentials", async () => {
    await expect(
      higgsfieldProvider({ keyId: "", keySecret: "" }).generate(shot),
    ).rejects.toThrow(/HIGGSFIELD_API_KEY/);
  });
});

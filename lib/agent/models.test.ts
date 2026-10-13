import { describe, it, expect, vi } from "vitest";
import { deepseek, parseJson } from "./models";

const res = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

describe("parseJson", () => {
  it("parses a bare object", () => {
    expect(parseJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips markdown fences and surrounding prose", () => {
    const text = "Sure!\n```json\n{\"a\": 2}\n```\nhope that helps";
    expect(parseJson<{ a: number }>(text)).toEqual({ a: 2 });
  });

  it("throws when there is no object", () => {
    expect(() => parseJson("no json here")).toThrow();
  });
});

describe("deepseek client", () => {
  it("returns text and token usage and computes a cost", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      res(200, {
        choices: [{ message: { content: "hello" } }],
        usage: { prompt_tokens: 1000, completion_tokens: 1000 },
      }),
    );
    const llm = deepseek({ fetchImpl, apiKey: "test-key" });
    const out = await llm.chat("deepseek-chat", [
      { role: "user", content: "hi" },
    ]);
    expect(out.text).toBe("hello");
    expect(out.tokens).toBe(2000);
    expect(out.costUsd).toBeGreaterThan(0);
  });

  it("throws without an API key", async () => {
    const llm = deepseek({ fetchImpl: vi.fn(), apiKey: "" });
    await expect(llm.chat("deepseek-chat", [])).rejects.toThrow(/API_KEY/);
  });
});

import { describe, it, expect, vi } from "vitest";
import { request, getJson, postJson, HttpError } from "./http";

const res = (status: number, body: string) => new Response(body, { status });

describe("http", () => {
  it("retries a 5xx then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(res(500, "boom"))
      .mockResolvedValueOnce(res(200, JSON.stringify({ ok: true })));

    const out = await request<{ ok: boolean }>("http://x", {
      fetchImpl,
      backoffMs: 0,
    });

    expect(out).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("throws HttpError after exhausting retries", async () => {
    const fetchImpl = vi.fn(async () => res(503, "down"));

    await expect(
      request("http://x", { fetchImpl, backoffMs: 0, retries: 2 }),
    ).rejects.toBeInstanceOf(HttpError);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("does not retry a 400", async () => {
    const fetchImpl = vi.fn(async () => res(400, "bad request"));

    await expect(
      request("http://x", { fetchImpl, backoffMs: 0, retries: 3 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("getJson and postJson set the method", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      res(200, JSON.stringify({ v: 1 })),
    );

    await getJson("http://x", { fetchImpl });
    await postJson("http://x", { a: 1 }, { fetchImpl });

    expect(fetchImpl.mock.calls[0]?.[1]?.method).toBe("GET");
    expect(fetchImpl.mock.calls[1]?.[1]?.method).toBe("POST");
    expect(fetchImpl.mock.calls[1]?.[1]?.body).toBe(
      JSON.stringify({ a: 1 }),
    );
  });
});

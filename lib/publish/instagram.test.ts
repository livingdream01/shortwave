import { describe, it, expect, vi } from "vitest";
import { InstagramPublisher } from "./instagram";
import { createPublisher } from "./registry";

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status });

interface LogEntry {
  url: string;
  method?: string;
  body?: Record<string, unknown>;
}

function makeFetch(statuses: ContainerStatusSeq, log: LogEntry[]) {
  let i = 0;
  return vi.fn<typeof fetch>(async (input, init) => {
    const url = String(input);
    const body = init?.body
      ? (JSON.parse(String(init.body)) as Record<string, unknown>)
      : undefined;
    log.push({ url, method: init?.method, body });

    if (url.endsWith("/media_publish")) return json({ id: "m1" });
    if (url.includes("fields=status_code")) {
      const seq = statuses;
      const value = seq[Math.min(i, seq.length - 1)];
      i++;
      return json({ status_code: value });
    }
    if (url.endsWith("/media")) return json({ id: "c1" });
    return json({}, 404);
  });
}

type ContainerStatusSeq = string[];

function publisher(statuses: ContainerStatusSeq, log: LogEntry[]) {
  return new InstagramPublisher({
    igUserId: "17841400000",
    accessToken: "tok",
    graphHost: "https://graph.instagram.com",
    apiVersion: "v23.0",
    fetchImpl: makeFetch(statuses, log),
    sleep: vi.fn(async () => {}),
    pollIntervalMs: 1,
    maxPollMs: 1000,
  });
}

const asset = { videoUrl: "https://cdn.example/a.mp4", caption: "hi" };

describe("InstagramPublisher.createContainer", () => {
  it("sends a REELS container with AI disclosure", async () => {
    const log: LogEntry[] = [];
    await publisher(["FINISHED"], log).createContainer(asset);
    const body = log[0]!.body!;
    expect(body.media_type).toBe("REELS");
    expect(body.video_url).toBe(asset.videoUrl);
    expect(body.is_ai_generated).toBe(true);
  });
});

describe("InstagramPublisher.awaitReady", () => {
  it("waits through IN_PROGRESS then resolves on FINISHED", async () => {
    const log: LogEntry[] = [];
    await expect(
      publisher(["IN_PROGRESS", "FINISHED"], log).awaitReady("c1"),
    ).resolves.toBeUndefined();
    expect(log.filter((l) => l.url.includes("status_code"))).toHaveLength(2);
  });

  it("throws on ERROR", async () => {
    const log: LogEntry[] = [];
    await expect(publisher(["ERROR"], log).awaitReady("c1")).rejects.toThrow(
      /ERROR/,
    );
  });
});

describe("InstagramPublisher.publish", () => {
  it("publishes a finished container and returns the media id", async () => {
    const log: LogEntry[] = [];
    const result = await publisher(["FINISHED"], log).publish(asset);
    expect(result.status).toBe("published");
    expect(result.externalId).toBe("m1");
    expect(log.some((l) => l.url.endsWith("/media_publish"))).toBe(true);
  });

  it("does NOT publish a container that errored (Review Focus #1)", async () => {
    const log: LogEntry[] = [];
    await expect(publisher(["ERROR"], log).publish(asset)).rejects.toThrow();
    expect(log.some((l) => l.url.endsWith("/media_publish"))).toBe(false);
  });
});

describe("createPublisher registry", () => {
  it("builds an instagram publisher", () => {
    const p = createPublisher({
      platform: "instagram",
      config: { igUserId: "1", accessToken: "t" },
    });
    expect(p.platform).toBe("instagram");
  });

  it("rejects unimplemented platforms", () => {
    expect(() => createPublisher({ platform: "tiktok" })).toThrow(/phase/);
  });
});

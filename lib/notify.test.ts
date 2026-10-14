import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { notify } from "./notify";

const logPath = () =>
  join(mkdtempSync(join(tmpdir(), "swalert-")), "alerts.log");

describe("notify", () => {
  it("always writes to the local log", async () => {
    const p = logPath();
    const res = await notify(
      { level: "warn", title: "token near expiry", detail: "5 days" },
      { logPath: p, resendKey: "", to: "" },
    );
    expect(res.emailed).toBe(false);
    expect(readFileSync(p, "utf8")).toContain("token near expiry");
  });

  it("emails via Resend when configured", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response("{}", { status: 200 }),
    );
    const res = await notify(
      { level: "error", title: "publish failed" },
      { logPath: logPath(), resendKey: "k", to: "me@x.com", fetchImpl },
    );
    expect(res.emailed).toBe(true);
    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(body.to).toBe("me@x.com");
    expect(body.subject).toContain("publish failed");
  });

  it("never throws when email fails", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new Error("network");
    });
    const res = await notify(
      { level: "error", title: "x" },
      { logPath: logPath(), resendKey: "k", to: "me@x.com", fetchImpl },
    );
    expect(res.emailed).toBe(false);
  });
});

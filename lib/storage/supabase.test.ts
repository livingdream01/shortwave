import { describe, it, expect } from "vitest";
import { uploadPublic } from "./supabase";

describe("uploadPublic", () => {
  it("refuses to upload when storage is not configured", async () => {
    await expect(
      uploadPublic("/tmp/does-not-exist.mp4", "x.mp4", "video/mp4", {
        url: "",
        serviceRoleKey: "",
      }),
    ).rejects.toThrow(/not configured/);
  });
});

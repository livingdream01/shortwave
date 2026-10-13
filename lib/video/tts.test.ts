import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { elevenLabs, mockTts } from "./tts";

describe("elevenLabs", () => {
  it("posts with the xi-api-key and writes the audio file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "swtts-"));
    const outPath = join(dir, "voice.mp3");
    const fetchImpl = vi.fn<typeof fetch>(async (url, init) => {
      expect(String(url)).toContain("/text-to-speech/");
      const headers = (init as RequestInit).headers as Record<string, string>;
      expect(headers["xi-api-key"]).toBe("k");
      return new Response(new Uint8Array([1, 2, 3, 4]));
    });

    const tts = elevenLabs({ apiKey: "k", voiceId: "v1", fetchImpl });
    const res = await tts.synthesize("hi", { outPath, lang: "en" });

    expect(res.provider).toBe("elevenlabs");
    expect(readFileSync(outPath).length).toBe(4);
  });

  it("throws without a key", async () => {
    const tts = elevenLabs({ apiKey: "", voiceId: "v", fetchImpl: vi.fn() });
    await expect(
      tts.synthesize("hi", { outPath: "/tmp/x.mp3" }),
    ).rejects.toThrow(/ELEVENLABS_API_KEY/);
  });
});

describe("mockTts", () => {
  it("returns the path without writing", async () => {
    const res = await mockTts().synthesize("hi", { outPath: "/tmp/none.mp3" });
    expect(res.provider).toBe("mock");
  });
});

import { writeFile } from "node:fs/promises";
import { config } from "../config";
import type { Lang } from "../types";

export interface TtsResult {
  provider: string;
  audioPath: string;
}

export interface TtsProvider {
  name: string;
  synthesize(
    text: string,
    opts: { outPath: string; voiceId?: string; lang?: Lang },
  ): Promise<TtsResult>;
}

export interface ElevenLabsConfig {
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  fetchImpl?: typeof fetch;
}

export function elevenLabs(cfg: ElevenLabsConfig = {}): TtsProvider {
  const modelId = cfg.modelId ?? "eleven_multilingual_v2";
  return {
    name: "elevenlabs",
    async synthesize(text, opts) {
      const apiKey = cfg.apiKey ?? config.elevenlabs.apiKey;
      const voiceId = opts.voiceId ?? cfg.voiceId ?? config.elevenlabs.voiceId;
      if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
      if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID is not set");

      const res = await (cfg.fetchImpl ?? fetch)(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({ text, model_id: modelId }),
        },
      );
      if (!res.ok) {
        throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      await writeFile(opts.outPath, bytes);
      return { provider: "elevenlabs", audioPath: opts.outPath };
    },
  };
}

/** No-op voice track for demo/offline runs. */
export function mockTts(): TtsProvider {
  return {
    name: "mock",
    async synthesize(_text, opts) {
      return { provider: "mock", audioPath: opts.outPath };
    },
  };
}

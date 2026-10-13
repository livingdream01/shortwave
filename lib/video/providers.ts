import { config } from "../config";
import { postJson } from "../http";
import type { ClipAsset, ShotSpec } from "../types";

export interface VideoProvider {
  name: string;
  generate(shot: ShotSpec): Promise<ClipAsset>;
}

/** Deterministic fallback: no remote model — Remotion animates the still. */
export function slideshowProvider(): VideoProvider {
  return {
    name: "slideshow",
    async generate(shot) {
      return {
        shotIndex: shot.index,
        provider: "slideshow",
        model: "remotion",
        durationSec: shot.durationSec,
      };
    },
  };
}

export interface FalConfig {
  key?: string;
  model?: string; // e.g. "fal-ai/veo3.1/fast"
  fetchImpl?: typeof fetch;
}

export function falProvider(cfg: FalConfig = {}): VideoProvider {
  const model = cfg.model ?? "fal-ai/veo3.1/fast";
  return {
    name: "fal",
    async generate(shot) {
      const key = cfg.key ?? config.fal.key;
      if (!key) throw new Error("FAL_KEY is not set");
      const data = await postJson<{ video?: { url?: string } }>(
        `https://fal.run/${model}`,
        { prompt: shot.prompt, aspect_ratio: "9:16", duration: shot.durationSec },
        { headers: { Authorization: `Key ${key}` }, fetchImpl: cfg.fetchImpl },
      );
      const url = data.video?.url;
      if (!url) throw new Error("fal returned no video url");
      return {
        shotIndex: shot.index,
        provider: "fal",
        model,
        durationSec: shot.durationSec,
        url,
      };
    },
  };
}

export interface ReplicateConfig {
  token?: string;
  model?: string; // "owner/name:version" or "owner/name"
  fetchImpl?: typeof fetch;
}

export function replicateProvider(cfg: ReplicateConfig = {}): VideoProvider {
  const model = cfg.model ?? "minimax/video-01";
  return {
    name: "replicate",
    async generate(shot) {
      const token = cfg.token ?? config.replicate.token;
      if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
      const data = await postJson<{ output?: string | string[] }>(
        "https://api.replicate.com/v1/predictions",
        {
          model,
          input: { prompt: shot.prompt, aspect_ratio: "9:16" },
        },
        {
          headers: { Authorization: `Bearer ${token}`, Prefer: "wait" },
          fetchImpl: cfg.fetchImpl,
        },
      );
      const out = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!out) throw new Error("replicate returned no output");
      return {
        shotIndex: shot.index,
        provider: "replicate",
        model,
        durationSec: shot.durationSec,
        url: out,
      };
    },
  };
}

export interface ProviderRegistry {
  get(name: string): VideoProvider;
  names(): string[];
}

export function registry(...providers: VideoProvider[]): ProviderRegistry {
  const map = new Map(providers.map((p) => [p.name, p]));
  return {
    get(name) {
      const p = map.get(name);
      if (!p) throw new Error(`Unknown video provider: ${name}`);
      return p;
    },
    names() {
      return [...map.keys()];
    },
  };
}

/**
 * Try each provider in order; on failure fall through, and finally
 * drop to the slideshow so a single shot failure never kills an episode
 * (Review Focus #3).
 */
export async function generateWithFallback(
  providers: VideoProvider[],
  shot: ShotSpec,
  onError?: (provider: string, err: unknown) => void,
): Promise<ClipAsset> {
  for (const p of providers) {
    try {
      return await p.generate(shot);
    } catch (err) {
      onError?.(p.name, err);
    }
  }
  return slideshowProvider().generate(shot);
}

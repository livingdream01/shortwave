import { config } from "../config";
import { getJson, postJson } from "../http";
import type { ClipAsset, ShotSpec } from "../types";
import type { VideoProvider } from "./providers";

export interface HiggsfieldConfig {
  keyId?: string;
  keySecret?: string;
  baseUrl?: string;
  /** Model endpoint path, e.g. "higgsfield-ai/dop/standard". */
  model?: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  pollIntervalMs?: number;
  maxPollMs?: number;
}

const DEFAULT_MODEL = "higgsfield-ai/dop/standard";

/** Pull the first output URL out of a completed Higgsfield status payload. */
export function extractOutputUrl(payload: unknown): string | undefined {
  const s = payload as Record<string, unknown> | null | undefined;
  const r = s?.result as Record<string, unknown> | undefined;
  const o = s?.output as Record<string, unknown> | undefined;
  const results = s?.results as Array<Record<string, unknown>> | undefined;
  const candidates = [
    r?.url,
    r?.video_url,
    o?.url,
    s?.url,
    s?.video_url,
    results?.[0]?.url,
  ];
  return candidates.find((c): c is string => typeof c === "string");
}

const DONE = new Set(["completed", "succeeded", "success", "done"]);
const FAILED = new Set(["failed", "error", "canceled", "cancelled"]);

/**
 * Higgsfield is a proprietary, paid generative-video API (NOT open source).
 * Async lifecycle: POST a model endpoint → poll status_url → download the file.
 * Registered as a VideoProvider alongside fal/Replicate; falls through if unset.
 */
export function higgsfieldProvider(cfg: HiggsfieldConfig = {}): VideoProvider {
  const model = cfg.model ?? config.higgsfield.model ?? DEFAULT_MODEL;
  return {
    name: "higgsfield",
    async generate(shot: ShotSpec): Promise<ClipAsset> {
      const keyId = cfg.keyId ?? config.higgsfield.keyId;
      const keySecret = cfg.keySecret ?? config.higgsfield.keySecret;
      if (!keyId || !keySecret) {
        throw new Error("HIGGSFIELD_API_KEY_ID / HIGGSFIELD_API_KEY_SECRET not set");
      }
      const base = cfg.baseUrl ?? config.higgsfield.baseUrl;
      const auth = `Key ${keyId}:${keySecret}`;

      const created = await postJson<{ request_id: string; status_url?: string }>(
        `${base}/${model}`,
        { prompt: shot.prompt, aspect_ratio: "9:16", duration: shot.durationSec },
        { headers: { Authorization: auth }, fetchImpl: cfg.fetchImpl },
      );
      const statusUrl =
        created.status_url ?? `${base}/requests/${created.request_id}/status`;

      const sleep =
        cfg.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
      const deadline = Date.now() + (cfg.maxPollMs ?? 300_000);

      for (;;) {
        const status = await getJson<{ status: string }>(statusUrl, {
          headers: { Authorization: auth },
          fetchImpl: cfg.fetchImpl,
        });
        if (DONE.has(status.status)) {
          const url = extractOutputUrl(status);
          if (!url) throw new Error("Higgsfield: completed without an output URL");
          return {
            shotIndex: shot.index,
            provider: "higgsfield",
            model,
            durationSec: shot.durationSec,
            url,
          };
        }
        if (FAILED.has(status.status)) {
          throw new Error(`Higgsfield request ${status.status}`);
        }
        if (Date.now() >= deadline) throw new Error("Higgsfield polling timed out");
        await sleep(cfg.pollIntervalMs ?? 5000);
      }
    },
  };
}

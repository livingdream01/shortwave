import type { PublishResult } from "../types";
import { config } from "../config";
import { getJson, postJson } from "../http";
import type { Publisher, PublishAsset } from "./types";

export type ContainerStatus =
  | "EXPIRED"
  | "ERROR"
  | "FINISHED"
  | "IN_PROGRESS"
  | "PUBLISHED";

export interface InstagramConfig {
  igUserId: string;
  accessToken: string;
  graphHost?: string;
  apiVersion?: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  pollIntervalMs?: number;
  maxPollMs?: number;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

export class InstagramPublisher implements Publisher {
  platform = "instagram";
  private host: string;
  private version: string;
  private fetchImpl?: typeof fetch;
  private sleep: (ms: number) => Promise<void>;
  private pollIntervalMs: number;
  private maxPollMs: number;

  constructor(private cfg: InstagramConfig) {
    this.host = cfg.graphHost ?? config.instagram.graphHost;
    this.version = cfg.apiVersion ?? config.instagram.apiVersion;
    this.fetchImpl = cfg.fetchImpl;
    this.sleep = cfg.sleep ?? defaultSleep;
    this.pollIntervalMs = cfg.pollIntervalMs ?? 4000;
    this.maxPollMs = cfg.maxPollMs ?? 300_000;
  }

  private headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.cfg.accessToken}` };
  }

  async createContainer(asset: PublishAsset): Promise<string> {
    const url = `${this.host}/${this.version}/${this.cfg.igUserId}/media`;
    const body: Record<string, unknown> = {
      media_type: "REELS",
      video_url: asset.videoUrl,
      caption: asset.caption,
      is_ai_generated: asset.isAiGenerated ?? true,
    };
    if (asset.trial) {
      body.trial_params = {
        graduation_strategy: asset.graduationStrategy ?? "MANUAL",
      };
    }
    const data = await postJson<{ id: string }>(url, body, {
      headers: this.headers(),
      fetchImpl: this.fetchImpl,
    });
    if (!data.id) throw new Error("Instagram did not return a container id");
    return data.id;
  }

  async statusOf(containerId: string): Promise<ContainerStatus> {
    const url =
      `${this.host}/${this.version}/${containerId}` +
      `?fields=status_code&access_token=${encodeURIComponent(this.cfg.accessToken)}`;
    const data = await getJson<{ status_code: ContainerStatus }>(url, {
      headers: this.headers(),
      fetchImpl: this.fetchImpl,
    });
    return data.status_code;
  }

  /** Poll a container until it is publishable. Throws on ERROR/EXPIRED/timeout. */
  async awaitReady(containerId: string): Promise<void> {
    const deadline = Date.now() + this.maxPollMs;
    for (;;) {
      const status = await this.statusOf(containerId);
      if (status === "FINISHED" || status === "PUBLISHED") return;
      if (status === "ERROR" || status === "EXPIRED") {
        throw new Error(`Instagram container ${containerId} is ${status}`);
      }
      if (Date.now() >= deadline) {
        throw new Error(
          `Instagram container ${containerId} not ready within ${this.maxPollMs}ms`,
        );
      }
      await this.sleep(this.pollIntervalMs);
    }
  }

  async publishContainer(containerId: string): Promise<string> {
    const url = `${this.host}/${this.version}/${this.cfg.igUserId}/media_publish`;
    const data = await postJson<{ id: string }>(
      url,
      { creation_id: containerId },
      { headers: this.headers(), fetchImpl: this.fetchImpl },
    );
    if (!data.id) throw new Error("Instagram did not return a media id");
    return data.id;
  }

  async publish(asset: PublishAsset): Promise<PublishResult> {
    const containerId = await this.createContainer(asset);
    // Never publish a container that is not FINISHED (Review Focus #1).
    await this.awaitReady(containerId);
    const mediaId = await this.publishContainer(containerId);
    return {
      platform: this.platform,
      externalId: mediaId,
      status: "published",
      raw: { containerId },
    };
  }
}

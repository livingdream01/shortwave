import type { PublishResult } from "../types";

export interface PublishAsset {
  /** Publicly reachable MP4 URL — Instagram fetches the video by URL. */
  videoUrl: string;
  caption: string;
  /** Meta requires AI content to be self-disclosed. Default true. */
  isAiGenerated?: boolean;
  /** Publish as a trial reel (shared to non-followers only) — safe experiments. */
  trial?: boolean;
  graduationStrategy?: "MANUAL" | "SS_PERFORMANCE";
}

export interface Publisher {
  platform: string;
  publish(asset: PublishAsset): Promise<PublishResult>;
}

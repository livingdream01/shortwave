import { InstagramPublisher, type InstagramConfig } from "./instagram";
import type { Publisher } from "./types";

export type PublisherConfig =
  | { platform: "instagram"; config: InstagramConfig }
  | { platform: "tiktok" | "youtube" | "douyin" };

export function createPublisher(cfg: PublisherConfig): Publisher {
  switch (cfg.platform) {
    case "instagram":
      return new InstagramPublisher(cfg.config);
    case "tiktok":
    case "youtube":
    case "douyin":
      throw new Error(
        `${cfg.platform} connector is not implemented yet (phase 2/3).`,
      );
    default:
      throw new Error(`Unknown platform: ${JSON.stringify(cfg)}`);
  }
}

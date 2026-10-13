export type Format =
  | "pet_soap"
  | "school_gossip"
  | "mythology"
  | "micro_horror"
  | "heist";

export type HookStyle = "question" | "shock" | "cold_open" | "pov" | "countdown";
export type LengthBucket = "short" | "medium" | "long";
export type VoiceStyle = "narrator" | "character" | "duet";
export type CaptionStyle = "karaoke" | "pop" | "minimal";
export type Lang = "en" | "zh";

export interface Arm {
  format: Format;
  hook: HookStyle;
  length: LengthBucket;
  voice: VoiceStyle;
  caption: CaptionStyle;
}

export interface ShotSpec {
  index: number;
  durationSec: number;
  prompt: string;
  startFramePrompt?: string;
  endFramePrompt?: string;
  camera?: string;
}

export interface ClipAsset {
  shotIndex: number;
  provider: string;
  model: string;
  durationSec: number;
  url?: string;
  localPath?: string;
  failed?: boolean;
  error?: string;
}

export interface Character {
  name: string;
  role: string;
  personality: string;
  appearancePrompt: string;
  refImagePrompt: string;
  voiceId?: string;
}

export interface Series {
  id: string;
  name: string;
  format: Format;
  artStyle: string;
  narration: Lang;
  captions: Lang[];
  voiceStyle: VoiceStyle;
  cadencePerDay: number;
  characterBible: Character[];
}

export type EpisodeStatus =
  | "planned"
  | "written"
  | "critiqued"
  | "generated"
  | "rendered"
  | "approved"
  | "published"
  | "failed";

export interface Episode {
  id: string;
  seriesId: string;
  index: number;
  title: string;
  hook: string;
  script: string;
  shots: ShotSpec[];
  caption: string;
  hashtags: string[];
  status: EpisodeStatus;
  score?: number;
  renderPath?: string;
  language: { narration: Lang; captions: Lang[] };
}

export type StepStatus = "pending" | "running" | "done" | "failed" | "rejected";

export interface AgentStep {
  name: string;
  model: string;
  status: StepStatus;
  input: string;
  output: string;
  tokens: number;
  costUsd: number;
}

export interface PublishResult {
  platform: string;
  externalId: string;
  permalink?: string;
  status: "published" | "failed" | "pending";
  raw?: unknown;
}

export interface MetricSnapshot {
  postId: string;
  pulledAt: string;
  reach: number;
  plays: number;
  retention3s: number;
  avgWatchPct: number;
  completion: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  follows: number;
  clicks: number;
}

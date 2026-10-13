/**
 * The canonical agent roster — the single source of truth for "who does what".
 *
 * Design rule: every role owns exactly ONE artifact and performs exactly ONE
 * task. No two roles share an artifact or a verb, so no work is duplicated
 * across agents. `roles.test.ts` enforces this invariant.
 */
export type RoleKind = "reasoning" | "service";

export interface AgentRole {
  key: string;
  label: string;
  kind: RoleKind;
  /** The single verb this role performs. */
  task: string;
  /** The single artifact this role owns (unique across the roster). */
  owns: string;
  consumes: string;
  produces: string;
  model?: string;
}

export const ROLES: AgentRole[] = [
  {
    key: "scout",
    label: "Trend Scout",
    kind: "reasoning",
    task: "scan current trends for the format",
    owns: "trend brief",
    consumes: "series + format playbook",
    produces: "angles · sounds · keywords",
    model: "deepseek-chat",
  },
  {
    key: "character-bible",
    label: "Character Bible",
    kind: "service",
    task: "maintain cast continuity",
    owns: "cast canon",
    consumes: "series + format playbook",
    produces: "consistent Character[]",
  },
  {
    key: "writer",
    label: "Writer",
    kind: "reasoning",
    task: "author the episode",
    owns: "episode script",
    consumes: "trend brief + cast canon",
    produces: "DraftEpisode (hook, script, shots)",
    model: "deepseek-chat",
  },
  {
    key: "critic",
    label: "Critic",
    kind: "reasoning",
    task: "judge virality + policy",
    owns: "verdict",
    consumes: "DraftEpisode",
    produces: "Critique (score, violations)",
    model: "deepseek-reasoner",
  },
  {
    key: "storyboard",
    label: "Storyboard",
    kind: "service",
    task: "derive the timed shot list + captions",
    owns: "shot list",
    consumes: "episode script + shots",
    produces: "ShotSpec[] + captions",
  },
  {
    key: "director",
    label: "Director",
    kind: "service",
    task: "route each shot to a provider/model",
    owns: "provider plan",
    consumes: "shot list",
    produces: "per-shot provider + model",
  },
  {
    key: "translator",
    label: "Translator",
    kind: "reasoning",
    task: "localize captions",
    owns: "caption translation",
    consumes: "English captions",
    produces: "Simplified-Chinese captions",
    model: "deepseek-chat",
  },
  {
    key: "renderer",
    label: "Renderer",
    kind: "service",
    task: "assemble the 9:16 reel",
    owns: "MP4 artifact",
    consumes: "props + clip assets",
    produces: "1080×1920 H.264 MP4",
  },
  {
    key: "publisher",
    label: "Publisher",
    kind: "service",
    task: "post to the platform",
    owns: "published post",
    consumes: "MP4 + caption",
    produces: "PublishResult (external id)",
  },
  {
    key: "analyst",
    label: "Analyst",
    kind: "service",
    task: "pull insights",
    owns: "metrics",
    consumes: "post id",
    produces: "MetricSnapshot @24/48/72h",
  },
  {
    key: "bandit",
    label: "Bandit",
    kind: "service",
    task: "allocate the next arm",
    owns: "arm allocation",
    consumes: "rewards",
    produces: "next arm + updated posteriors",
  },
];

const BY_KEY = new Map(ROLES.map((r) => [r.key, r]));

export function role(key: string): AgentRole {
  const r = BY_KEY.get(key);
  if (!r) throw new Error(`Unknown agent role: ${key}`);
  return r;
}

export function reasoningRoles(): AgentRole[] {
  return ROLES.filter((r) => r.kind === "reasoning");
}

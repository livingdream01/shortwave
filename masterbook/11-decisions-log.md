# Decisions Log (ADRs)

**D1 — Base = new standalone repo `~/shortwave`.** Reuses Reeloso's proven patterns (DeepSeek agent loop, Remotion 9:16, mission-control trace, masterbook docs) but is a clean codebase. Reason: this product diverges (multi-format drama, multi-platform connectors, experiments).

**D2 — Runtime = Approach A.** Next.js 16 control plane + local Node worker. Reason: renders (multi-clip + voice + captions) exceed serverless limits; a control plane gives the operator approval + experiment visibility.

**D3 — Video = pluggable multi-provider (fal.ai primary).** OpenGen proves one-workspace breadth wins; we automate model routing via a Director agent. Reason: no single model wins every shot; A/B-ing models is core to the experiment loop.

**D4 — All five formats live from day one.** Reason: operator chose experiment velocity over a single polished format; the bandit needs multiple arms to learn.

**D5 — Monetization = affiliate-first.** Reason: fastest income, no follower threshold; creator-payout programs (YouTube YPP, TikTok Creator Rewards) are gated by growth/region and deferred to phase 2.

**D6 — Policy-safe by default.** Stylized (non-photoreal humans), `is_ai_generated=true`, mandatory caption disclosure, original IP only. Reason: Meta/TikTok AI policy, likeness/deepfake bans, reach penalties for "AI slop".

**D7 — Publish to a test IG account first; support trial reels.** Reason: never risk the operator's main account during experiments.

**D8 — Bilingual EN narration + CN burned-in captions.** Reason: HK base → global reach differentiator vs. FacelessReels.

**D9 — Worker scheduling = launchd (local).** Reason: operator chose local execution; no cloud compute in phase 1.

**D10 — Tests = Vitest for pure libs (connectors, bandit, prompt builders); render smoke test for Remotion.** Reason: fast, deterministic; the risk lives in payload correctness and math.

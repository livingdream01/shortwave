# Shortwave — Overview & Spec

**North star.** An autonomous, bilingual AI-drama studio. One operator feeds it a series concept; the agent researches, writes, casts a consistent AI actor set, storyboards, generates and assembles a vertical reel, publishes it to Instagram, measures it, and learns which formats draw a global audience — then attaches affiliate monetization. Owned and self-hosted, not a rented tool.

**Positioning vs. the field.**
- *OpenGen.ai* = a model aggregator (14+ video models, image models, voice) with no posting and no agent loop. We take its **breadth** and automate it.
- *FacelessReels.com* = a template factory with auto-post to IG/TikTok/YouTube. We beat it on **character continuity, serialization, experimentation (bandit), bilingual reach, data ownership, and monetization**.

**Goal (this phase).** Prove the loop end-to-end on **Instagram**: produce an original reel in each of five formats and auto-publish one to the operator's account.

**Non-goals (this phase).** TikTok / YouTube / Douyin connectors (phase 2–3), multi-tenant SaaS, photoreal human likeness.

## Success criteria
1. Agent produces an original, stylized reel in **each of 5 formats** — EN narration + CN burned-in captions, AI-disclosed.
2. One reel **published to Instagram** via the Content Publishing API, automatically, end-to-end.
3. Experiment engine assigns arms and pulls Instagram insights at 24h.
4. Affiliate link registry injects tracked links + disclosure into captions.
5. `masterbook/` complete; `lint`, `typecheck`, `build` green; one verified real post.

## Architecture
**Control plane** — Next.js 16 (App Router, TS, Tailwind v4): onboarding/OAuth, dashboard, Mission Control, experiments.
**Execution plane** — a worker (`npm run worker`, scheduled via `launchd`): model calls, Remotion render, publish, insights (renders exceed serverless limits).
**Data** — Supabase Postgres + a **public Storage bucket** (Instagram fetches video by URL).
**Brain** — DeepSeek. **Video/Image** — fal.ai. **TTS** — ElevenLabs (EN) with CN-capable fallback. **Captions** — Whisper.

## The pipeline
`TRIGGER → SCOUT → WRITER → CHARACTER BIBLE → STORYBOARD → DIRECTOR → CRITIC (reject→rewrite ≤3) → VOICE → ASSEMBLE → APPROVE → PUBLISH → MEASURE`
Every hop is logged to `agent_steps` for Mission Control. The **Critic** gates virality *and* policy (original IP, no real-person likeness, mandatory AI disclosure). The **Director** routes each shot to a provider/model by cost and quality.

## Formats (all five live from day one; the bandit allocates)
| Arm | Sketch | Notes |
|---|---|---|
| `pet_soap` | anthropomorphic pets, serialized | cheapest, cutest, safest |
| `school_gossip` | relatable stylized humans | strong hooks |
| `mythology` | public-domain retellings | IP-safe |
| `micro_horror` | creepy short stories | high retention |
| `heist` | mini-thrillers | product-tie-in ready |

## Publishing
**Instagram now.** Meta app → Instagram product → OAuth scopes `instagram_business_basic`, `instagram_business_content_publish`, `instagram_manage_insights`. Operator is app admin, so Dev Mode posts to their *own* account with **no App Review**. Token: code → short-lived → **long-lived (60d)**, encrypted at rest, auto-refreshed. Publish: create container (`REELS`, public `video_url`, `is_ai_generated=true`) → poll `status_code` → `media_publish`. Publish first to a **test account**; trial reels supported. TikTok/YouTube/Douyin are isolated connector modules for later phases.

## Experiment engine
Arms = format × hook × length × voice × caption-style. Insights pulled at 24/48/72h (reach, plays, 3s retention, avg watch %, completion, saves, shares, follows, clicks). A **Thompson-sampling bandit** re-weights arms and feeds the planner.

## Monetization (affiliate-first)
`lib/monetize` holds program configs and tracked links (UTM). Auto-inject into caption/bio/pinned comment; enforce each program's rules (FacelessReels: organic-only, no self-referral; OpenArt/Oakgen alternatives) and **FTC disclosure**. Creator-payout programs (YouTube YPP, TikTok Creator Rewards) are phase 2. Shortwave's own affiliate program later.

## Stack table
| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TS) |
| Styling | Tailwind v4 |
| DB / Storage | Supabase (Postgres + public Storage) |
| Agent brain | DeepSeek (`deepseek-chat`/reasoner) |
| Video/Image | fal.ai (+ Replicate fallback) |
| TTS | ElevenLabs (EN) / CN fallback |
| Captions | Whisper (word timestamps) |
| Render | Remotion (9:16 H.264) |
| Tests | Vitest |
| Scheduler | launchd (local) |

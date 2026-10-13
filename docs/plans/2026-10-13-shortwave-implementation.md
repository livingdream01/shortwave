# Shortwave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) to implement this plan. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build an autonomous bilingual AI-drama studio that produces original reels in five formats and auto-publishes to Instagram.

**Architecture:** Next.js 16 control plane + a local Node worker. Pure TypeScript libraries (`lib/*`) hold all logic and are unit-tested with Vitest; the worker orchestrates them; Remotion assembles the MP4.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Vitest, Remotion, Supabase (Postgres + Storage), DeepSeek, fal.ai, ElevenLabs, Whisper.

**Spec:** `masterbook/00-overview.md`

## Global Constraints
- Node ≥ 20. TypeScript strict. No `any` in exported signatures.
- All external HTTP via a single `lib/http.ts` wrapper (retries + timeout).
- Instagram: publish only with `is_ai_generated=true`; never post photoreal human likeness.
- Secrets only from env; never committed. `.env.local` is gitignored.
- Every mutation writes a row to `agent_steps` (traceability).
- Output video: 1080×1920, H.264, ≤ 90s.

## Review Focus
1. **Instagram container status** — a `FINISHED` vs `IN_PROGRESS`/`ERROR` container must not be published prematurely (poll, don't race).
2. **Token expiry** — a 60-day token used past expiry must fail loudly and trigger refresh, not silently 401 mid-publish.
3. **Provider failure** — one fal.ai shot failing must not kill the whole episode (fallback to slideshow shot).
4. **Captions overflow** — long EN lines must wrap/hold to ≤2 lines, never overflow the 1080×1920 frame.
5. **Bandit cold start** — the first post of an arm must be explorable (no divide-by-zero, uniform prior).

---
## File Structure
```
lib/http.ts                     retrying fetch wrapper
lib/config.ts                   env + demo-mode detection
lib/types.ts                    shared domain types
lib/agent/models.ts             DeepSeek client (mockable)
lib/agent/prompts.ts            prompt builders per role
lib/agent/niches.ts             format-arm playbooks
lib/agent/pipeline.ts           orchestrates the 12 steps
lib/video/providers.ts          VideoProvider registry (fal/replicate/slideshow)
lib/video/tts.ts                TtsProvider (elevenlabs/mock)
lib/video/captions.ts           whisper + EN->CN translation
lib/render/render.ts            Remotion render invocation
lib/publish/types.ts            Publisher interface
lib/publish/instagram.ts        IG container -> poll -> publish
lib/publish/registry.ts         connector registry
lib/storage/supabase.ts         public bucket upload
lib/monetize/programs.ts        affiliate program configs
lib/monetize/links.ts           link build + caption injection
lib/experiments/bandit.ts       Thompson sampling
lib/experiments/arms.ts         arm space + params
remotion/ReelVideo.tsx          9:16 composition
remotion/Root.tsx               Remotion root
worker/index.ts                 queue runner (generate/render/publish/measure)
app/                            Next.js control plane
supabase/schema.sql             tables + RLS
```

---
## M0 — Scaffold
### Task 0.1: Project + tooling
- [ ] `package.json` (next 16, react 19, remotion, vitest, typescript, tailwind), `tsconfig.json` (strict), `next.config.ts`, `vitest.config.ts`, `.gitignore`, `.env.example`.
- [ ] Test: `npm run typecheck` and `npx vitest run` (empty suite passes).

### Task 0.2: Config + HTTP + types
**Files:** `lib/config.ts`, `lib/http.ts`, `lib/types.ts`
**Produces:** `config` (env, `isDemo`), `getJson/postJson` (retry+timeout), domain types (`Arm`, `Format`, `ShotSpec`, `ClipAsset`, `Episode`, `PublishResult`, `MetricSnapshot`).
- [ ] Test: `http.test.ts` — retries on 5xx, throws after N, tolerates 4xx.
- [ ] Test: `config.test.ts` — demo mode when keys absent.

### Task 0.3: Supabase schema
- [ ] `supabase/schema.sql` with `accounts, series, characters, episodes, shots, assets, posts, metrics, experiments, affiliate_programs, affiliate_links, runs, agent_steps`.

---
## M1 — Agent brain
### Task 1.1: DeepSeek client
**Files:** `lib/agent/models.ts`
**Produces:** `chat(role, messages, opts)` → `{text, tokens, costUsd}`; injectable for tests.
- [ ] Test: returns parsed text; records token usage.

### Task 1.2: Prompt builders + niches
**Files:** `lib/agent/prompts.ts`, `lib/agent/niches.ts`
**Produces:** `buildScout/Writer/Critic/Publish/Translate` prompts; `FORMATS` playbooks (5 arms).
- [ ] Test: writer prompt includes format playbook + language pair; critic prompt lists policy rules.

### Task 1.3: Character Bible (consistency)
**Files:** `lib/agent/pipeline.ts` (part)
**Produces:** `buildCharacterBible(series, llm)` → recurring cast with `appearance_prompt` + `ref_image_prompt`.
- [ ] Test: cast persists across two episodes with identical `appearance_prompt`.

### Task 1.4: Pipeline orchestrator
**Files:** `lib/agent/pipeline.ts`
**Produces:** `runPipeline({series, trigger, deps})` → `Episode` + `AgentStep[]`; critic loop capped at 3; every step traced.
- [ ] Test: critic rejection triggers ≤3 rewrites then approval; steps recorded.

---
## M2 — Video factory
### Task 2.1: Providers
**Files:** `lib/video/providers.ts`
**Produces:** `VideoProvider` interface + `fal`, `replicate`, `slideshow` (Remotion fallback); `generate(shot)` → `ClipAsset`.
- [ ] Test: registry picks by name; unknown provider throws; provider failure falls back to `slideshow`.

### Task 2.2: TTS + captions
**Files:** `lib/video/tts.ts`, `lib/video/captions.ts`
**Produces:** `synthesize(text, voice, lang)`; `transcribe(audio)` word timestamps; `translate(text, "en->zh")`.
- [ ] Test: caption lines wrap to ≤2 lines at ≤18 chars/line for CN.

### Task 2.3: Remotion composition + render
**Files:** `remotion/ReelVideo.tsx`, `remotion/Root.tsx`, `lib/render/render.ts`
**Produces:** `renderEpisode(episode, assets) → mp4Path`.
- [ ] Test: render smoke (3 shots, 5s) produces a non-empty file.

---
## M3 — Formats + series
### Task 3.1: Arm space + series engine
**Files:** `lib/experiments/arms.ts`
**Produces:** `arms()` → cross product of format × hook × length × voice × caption style; `Series` creation.
- [ ] Test: arm count and uniqueness.

---
## M4 — Instagram publishing (critical path)
### Task 4.1: IG connector
**Files:** `lib/publish/types.ts`, `lib/publish/instagram.ts`, `lib/publish/registry.ts`
**Produces:** `Publisher` interface; `InstagramPublisher.createContainer/poll/publish`; `IG_API`.
- [ ] Test: `create-container` payload includes `media_type=REELS`, `is_ai_generated=true`, `video_url`; poll loop stops on `FINISHED`, throws on `ERROR`, times out safely; publish requires a `FINISHED` container (Review Focus #1).

### Task 4.2: OAuth + token store
**Files:** `app/api/oauth/instagram/route.ts`, `lib/publish/tokens.ts`
**Produces:** `exchangeCode`, `toLongLived`, `needsRefresh`, `refresh`.
- [ ] Test: `needsRefresh` true within 7 days of expiry; expired token throws loudly (Review Focus #2).

### Task 4.3: Publish e2e (test account)
- [ ] Script `scripts/publish-test.ts` posts a rendered reel to the configured test account.

---
## M5 — Experiments + monetize
### Task 5.1: Bandit
**Files:** `lib/experiments/bandit.ts`
**Produces:** `thompsonSample(posteriors) → arm`; `update(posterior, reward)`.
- [ ] Test: uniform prior at cold start; winning arm selected > 60% after seeded successes (Review Focus #5).

### Task 5.2: Monetize registry
**Files:** `lib/monetize/programs.ts`, `lib/monetize/links.ts`
**Produces:** program configs; `trackedLink(program, campaign)`; `injectCaption(caption, links, {disclosure:true})`.
- [ ] Test: disclosure appended when links present; UTM present; no injection for `self_referral: false` programs.

---
## M6 — Insights, docs, verify
### Task 6.1: Insights pull + analyst feedback
- [ ] Pull IG media insights at 24h; write `metrics`; feed bandit.

### Task 6.2: Control plane (minimal)
- [ ] `/dashboard` content queue, `/mission-control` run trace, `/experiments` arm table.

### Task 6.3: Masterbook + verify
- [ ] Remaining masterbook docs (07 layout/guidelines, 08 experiment protocol, 09 monetization, 10 runbooks).
- [ ] `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run` all green; one real post verified.

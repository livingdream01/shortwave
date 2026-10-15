# Shortwave — Masterplan (build → open source)

The single source of truth for taking Shortwave from "works on your Mac" to a
public, clone-and-run tool anyone can download to their laptop.

## 1. Vision
An autonomous, bilingual (EN + 中文) AI-drama studio. One operator (or none)
feeds it a concept; it researches, writes, casts a consistent AI actor set,
generates and assembles vertical reels, publishes them (Instagram first), measures
results, runs experiments, and attaches affiliate monetization — self-hosted and
fully open source.

## 2. Status today (verified)
| Area | State |
|---|---|
| Agent loop (scout → writer → critic ≤3 → storyboard → director) | ✅ built, traced, tested |
| 5 formats + 675-arm bandit | ✅ |
| Video providers: fal · Higgsfield · Replicate · slideshow fallback | ✅ |
| Remotion 9:16 render (1080×1920 H.264) | ✅ real MP4 produced |
| Instagram publishing (container → poll → publish, AI disclosure, trial reels) | ✅ unit-tested |
| Auth portal (magic link) + encrypted token vault (AES-256-GCM, RLS) | ✅ e2e verified |
| Unattended ops (boot · sweep · refresh · keepawake · alerts · health) | ✅ installed |
| 92 tests · lint · typecheck · build | ✅ all green |
| Live IG post | ⏳ needs the operator's Meta app (one consent) |

## 3. Gap analysis — what's still missing
**Website/UX:** onboarding wizard; content-pack generator; per-account scheduler UI;
episode/series browser; render preview + one-tap approve; settings for brand kit;
mobile layout polish; empty states.
**Generation:** free/open-model provider (self-host Wan/LTX or free-tier inference);
voice cloning; music generation; stock b-roll; scene continuity via reference frames.
**Publishing:** TikTok (Content Posting API + audit); YouTube Shorts (Data API v3);
Douyin; scheduling/queue with retries; per-post analytics pull (currently stubbed).
**Growth:** bandit live feedback loop wired to insights; A/B prompt library; hook A/B;
auto-thumbnail/hook-frame selection.
**Platform:** multi-user accounts; project/series management; usage & cost dashboard;
webhooks for Meta; token refresh cron surfaced in UI.
**Open source:** LICENSE ✅, CONTRIBUTING, CoC, SECURITY, CI, Docker path, seed/demo
data, release process, docs site.

## 4. Roadmap

### Phase 0 — Foundation ✅ (done)
Core pipeline, providers, render, IG publish, portal + vault, unattended ops,
Higgsfield provider, MIT license.

### Phase 1 — "Runs for anyone" (open-source MVP)
- **MCP server** (`npm run mcp`) — exposes `shortwave_generate`, `shortwave_publish`,
  `shortwave_health` as tools so Claude/any MCP client can drive the studio (parity with
  Higgsfield's Claude plugin).
- **One-command bootstrap**: `make setup` / `npm run setup` → install, `supabase start`,
  seed, print the login URL.
- **Docker path**: `docker compose up` for the app + worker (Supabase via its CLI).
- **Demo mode everywhere** (zero keys → real MP4 via mock brain + slideshow).
- **Docs site** (Mintlify/Nextra) generated from `masterbook/`.
- **CI** on GitHub Actions: lint · typecheck · test · build on PRs.
- Acceptance: a newcomer clones, runs one command, and renders an MP4 with no keys.

### Phase 2 — "Multi-platform"
- TikTok Content Posting connector (+ document the audit gate).
- YouTube Shorts upload connector (also unlocks YPP).
- Insights pull wired to the bandit (24/48/72h), real self-improvement.
- Scheduler UI + queue with retries/backoff.
- Free provider: self-hosted Wan/LTX adapter (`SW_VIDEO_CACHE`, local GPU optional).

### Phase 3 — "Studio"
- Onboarding wizard, content pack, episode browser, render preview + approve.
- Multi-account + brand kit per series.
- Cost/usage dashboard; webhook receiver.
- Douyin connector (requires a mainland entity — documented, opt-in).

### Phase 4 — "Ecosystem"
- Template/series marketplace (import a series JSON).
- Plugin/provider SDK (drop-in `VideoProvider`).
- i18n of the UI; localization of the studio itself.
- Hosted Cloud option (same code, managed Supabase + worker).

## 5. Open-source readiness checklist
- [x] MIT `LICENSE`
- [ ] `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`  (this pass)
- [ ] `ROADMAP.md` (this plan, trimmed)
- [ ] GitHub Actions CI (lint · typecheck · test · build)
- [ ] Issue/PR templates; labels (`good first issue`, `provider`, `connector`)
- [ ] No secrets committed; `.env.example` complete; demo mode default
- [ ] README: badges, 60-second quickstart, screenshots, architecture diagram
- [ ] Changelog + SemVer; tagged releases
- [ ] Docs generated from `masterbook/`

## 6. "Download to your laptop" paths
1. **Git clone** (primary): `git clone … && cd shortwave && make setup && npm run dev`.
2. **Docker**: `docker compose up` (app + worker); Supabase via `supabase start`.
3. **Release tarball**: GitHub Releases attach a source tarball per tag.
4. (Later) `npx create-shortwave` scaffolder, or a Homebrew tap.

## 7. Quality & guardrails
- Every PR: `lint`, `typecheck`, `vitest`, `build` (CI-enforced).
- Pure libs are unit-tested; connectors tested against mocked HTTP.
- Policy guardrails stay pinned: original IP only, no real-person likeness,
  `is_ai_generated=true`, caption disclosure.
- Conventional Commits; SemVer; `CHANGELOG.md` per release.

## 8. Community
- `CONTRIBUTING.md` with the "add a provider / add a connector / add a format" recipes.
- `CODE_OF_CONDUCT.md` (Contributor Covenant).
- `SECURITY.md` — report privately; never commit tokens.
- Discussion categories: Providers · Formats · Connectors · Showcase.

## 9. Monetization of the project itself
- **Sponsors** (GitHub Sponsors / Open Collective) — the tool is free.
- **Shortwave Cloud** (optional hosted) — same code, managed Supabase + always-on worker.
- **Affiliate** — the studio already injects affiliate links; docs link the tools it uses.
- Enterprise support / setup for agencies.

## 10. Risks & non-goals
- **Non-goal:** credential-based / unofficial automation (bans accounts) — we use the
  official APIs only.
- Meta App Review: needed only to post to *other people's* accounts.
- TikTok audit, Douyin entity: external gates, documented, opt-in.
- Model APIs change frequently → providers are thin, swappable adapters.
- Cost: video generation is the main variable cost → Director routes cheap-first.

## 11. Success metrics
- Time-to-first-MP4 from a clean clone: **< 10 minutes, zero keys**.
- CI green on `main`; > 90% of `lib/` covered by tests.
- A newcomer can add a provider/connector by following one doc page.
- First external contributor PR merged within 30 days of public launch.

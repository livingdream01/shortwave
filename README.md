# Shortwave

**An autonomous, bilingual AI-drama studio.** One operator feeds it a series
concept; the agent researches, writes, casts a consistent AI actor set, storyboards,
generates and assembles a vertical reel, publishes it to Instagram, measures it, and
learns which formats hold a global audience — then attaches affiliate monetization.

Built Hong-Kong-based, targeting a global English audience, with Simplified-Chinese
captions layered on.

<p>
  <img src="https://img.shields.io/badge/license-MIT-059669" alt="MIT"/>
  <img src="https://img.shields.io/badge/tests-92%20passing-059669" alt="tests"/>
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/self--hosted-yes-059669" alt="self-hosted"/>
</p>

> Self-hosted, MIT-licensed, and runs in **demo mode with zero API keys** — clone it
> and render a real MP4 in minutes.

## Quickstart (2 minutes, no keys)
```bash
git clone https://github.com/livingdream01/shortwave && cd shortwave
make setup        # install, start Supabase, create .env.local
make demo         # → a real 1080×1920 MP4 in out/renders/, fully offline
make dev          # portal at http://localhost:3040
```
Driving it from **Claude / any MCP client**: `make mcp` (tools: `shortwave_health`,
`shortwave_generate`, `shortwave_list_formats`, `shortwave_connect`).

## What works right now
- **Agent loop:** scout → write → character-bible → storyboard → director → critic
  (reject↔rewrite, capped) → assemble → render → publish → measure.
- **Five formats:** pet soap, school gossip, mythology, micro-horror, heist.
- **Video providers:** fal.ai · **Higgsfield** · Replicate · Remotion slideshow
  fallback — pluggable, routed per shot.
- **Real video:** Remotion renders a **1080×1920 H.264 MP4** with bilingual captions.
- **Instagram publishing:** Content Publishing API (container → poll → publish) with
  `is_ai_generated=true`; App-Review-free path for your own account; trial reels.
- **Experiment engine:** Thompson-sampling bandit over `format × hook × length ×
  voice × caption` (675 arms).
- **Monetization:** affiliate link registry with UTM tracking + FTC disclosure.
- **Login portal:** email magic-link sign-in (Supabase Auth) + a `/connections`
  page where Instagram is linked; OAuth tokens are **AES-256-GCM encrypted at
  rest** and never reach the browser.
- **Unattended ops:** `npm run sweep` (refresh → publish → alert) on a launchd
  schedule, a token-refresh job, a **keep-awake** helper, email alerting, and
  `GET /api/health`. See `masterbook/14-unattended-ops.md`.
- **MCP server:** drive the whole studio from Claude (parity with hosted plugins).

## Login portal & connections (local)
```bash
brew install supabase/tap/supabase
supabase start            # Postgres + Auth + Storage + Mailpit
supabase db reset         # applies supabase/migrations/*
npm run dev               # portal at http://localhost:3040 (redirects to /login)
```
Sign in with a magic link — read it from **Mailpit at http://127.0.0.1:54324**.
Only `OPERATOR_EMAIL` may sign in. Then open **/connections → Connect Instagram**.
Secrets live in `.env.local` (gitignored): `SW_TOKEN_KEK`, `IG_APP_ID`,
`IG_APP_SECRET`. See `masterbook/13-auth-and-vault.md`.

## Quickstart
```bash
npm install
cp .env.example .env.local          # optional; runs in demo mode without keys

npm run worker -- --demo            # produce a real MP4, offline, no keys
npm run dev                         # control plane at http://localhost:3040
npm run lint && npm run typecheck && npx vitest run && npm run build
```
Rendered reels land in `out/renders/`. Live runs read keys from `.env.local`.

## Commands
| Command | What it does |
|---|---|
| `npm run worker -- --demo` | full pipeline, offline (mock brain + slideshow + real render) |
| `npm run worker -- --format=heist` | live brain, generate only |
| `npm run worker -- --publish` | generate **and** post to Instagram |
| `npm run dev` | Next.js control plane (Dashboard · Mission Control · Experiments) |
| `npm run render` | render a sample episode to `out/renders/smoke.mp4` |
| `npm run remotion` | Remotion Studio (timeline preview) |
| `npm run lint` / `typecheck` / `test` / `build` | quality gates |

## Architecture
```
app/            Next.js 16 control plane (dashboard, mission-control, experiments, oauth)
lib/agent/      scout · writer · character-bible · storyboard · director · critic · pipeline
lib/video/      providers(fal, replicate, slideshow) · tts · captions
lib/render/     episode → Remotion props → MP4
lib/publish/    instagram connector · oauth tokens · registry
lib/experiments/ arms · bandit
lib/monetize/   affiliate programs · tracked links · caption injection
lib/storage/    Supabase public bucket
remotion/       ReelVideo (9:16) + Root + index
worker/         pipeline runner + render CLI
supabase/       schema.sql
masterbook/     docs (below)
```
Control plane = Next.js; execution plane = a local worker (renders exceed
serverless limits). Data = Supabase Postgres + public Storage.

## Documentation (`masterbook/`)
| File | Contents |
|---|---|
| `00-overview.md` | spec, positioning, success criteria |
| `02-format-library.md` | the five formats + series engine |
| `03-hook-library.md` | hook styles and rules |
| `04-agent-workflow.md` | the loop, models, critic gate (Mermaid diagram) |
| `05-provider-setup.md` | fal · Replicate · ElevenLabs · Whisper · Supabase · DeepSeek |
| `06-ig-oauth-setup.md` | step-by-step Instagram connection (no App Review) |
| `07-layout-and-guidelines.md` | 1080×1920 safe zones, captions, policy |
| `08-experiment-protocol.md` | bandit, reward function, measurement |
| `09-monetization-and-partners.md` | affiliate programs + creator-payout gates |
| `10-runbooks.md` | cron, publish, token rotation, troubleshooting |
| `11-decisions-log.md` | ADRs |
| `12-agent-roles.md` | no-duplicated-work ownership map |
| `13-auth-and-vault.md` | portal auth + encrypted token vault |
| `14-unattended-ops.md` | scheduled sweep, refresh, keep-awake, alerting |
| `15-masterplan.md` | **the full build → open-source masterplan** |

## Status
Phase 0 complete and verified: `lint`, `typecheck`, `build` green; **92 tests**;
end-to-end demo produced a real 1080×1920 MP4; login portal + encrypted vault
verified; unattended jobs installed. Live Instagram posting needs the operator's
Meta app (one consent) — see `masterbook/06-ig-oauth-setup.md`.

## Contributing
Open source under MIT. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the
provider / connector / format recipes, [`ROADMAP.md`](ROADMAP.md) for direction, and
[`masterbook/15-masterplan.md`](masterbook/15-masterplan.md) for the full plan.
CI runs `lint · typecheck · test · build` on every PR.

## Roadmap
MCP + one-command bootstrap + Docker (Phase 1) → TikTok & YouTube Shorts connectors
+ live bandit feedback (Phase 2) → studio UX (Phase 3) → ecosystem (Phase 4).
Full detail in `masterbook/15-masterplan.md`.

## License
[MIT](LICENSE) © 2026 Shortwave contributors.

# Shortwave

**An autonomous, bilingual AI-drama studio.** One operator feeds it a series
concept; the agent researches, writes, casts a consistent AI actor set, storyboards,
generates and assembles a vertical reel, publishes it to Instagram, measures it, and
learns which formats hold a global audience — then attaches affiliate monetization.

Built Hong-Kong-based, targeting a global English audience, with Simplified-Chinese
captions layered on.

## What works right now
- **Agent loop:** scout → write → character-bible → storyboard → director → critic
  (reject↔rewrite, capped) → assemble → render → publish → measure.
- **Five formats:** pet soap, school gossip, mythology, micro-horror, heist.
- **Real video:** Remotion renders a **1080×1920 H.264 MP4** with bilingual captions.
- **Instagram publishing:** Content Publishing API (container → poll → publish) with
  `is_ai_generated=true`; App-Review-free path for your own account.
- **Experiment engine:** Thompson-sampling bandit over `format × hook × length ×
  voice × caption` (675 arms).
- **Monetization:** affiliate link registry with UTM tracking + FTC disclosure.

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

## Status
Phase 1 complete and verified: `lint`, `typecheck`, `build` green; **56 tests**;
end-to-end demo produced a real 1080×1920 MP4. Live Instagram posting needs your
Meta app credentials (`06-ig-oauth-setup.md`).

## Roadmap
TikTok Content Posting API (needs `video.publish` audit) → YouTube Shorts (also
unlocks YPP) → Douyin (needs a mainland entity) → creator-payout optimization →
Shortwave's own affiliate program.

## License
Private. All rights reserved.

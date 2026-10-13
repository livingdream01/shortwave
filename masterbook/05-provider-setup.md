# Provider Setup

Shortwave is provider-agnostic. Each integration is a thin adapter behind an
interface, so you can swap or stack providers without touching the pipeline.

## Video — fal.ai (primary)
- Sign up at <https://fal.ai>, create a key → `FAL_KEY`.
- Default model in `lib/video/providers.ts`: `fal-ai/veo3.1/fast` (swap for
  `fal-ai/kling-*`, `fal-ai/wan-*`, `fal-ai/minimax-*`, `fal-ai/seedance`).
- One API, many models — this is how the **Director** routes shots by cost/quality.

## Video — Replicate (fallback)
- Key → `REPLICATE_API_TOKEN`. Default `minimax/video-01`.
- Used automatically if fal fails; then the Remotion slideshow as last resort.

## Voice — ElevenLabs (TTS)
- Key → `ELEVENLABS_API_KEY`, pick a voice → `ELEVENLABS_VOICE_ID`.
- Model `eleven_multilingual_v2` handles EN (and CN, if you narrate in Chinese).

## Captions — Whisper
- `OPENAI_API_KEY` enables word-level timestamps for karaoke captions.
- Offline, `lib/video/captions.ts` estimates cue timings from sentence length, so
  the pipeline still runs without a key.

## Storage — Supabase (required to publish)
- Create a project → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Create a **public** bucket named `shortwave` (`SUPABASE_BUCKET`).
- Instagram fetches the reel by URL, so the object must be publicly reachable.
- Apply the schema: `psql "$DATABASE_URL" < supabase/schema.sql`.

## Brain — DeepSeek
- `DEEPSEEK_API_KEY`. OpenAI-compatible; `deepseek-chat` (fast) + `deepseek-reasoner`
  (thinking, for the Critic).

## Demo mode
With no keys set, Shortwave runs **demo mode**: `mockLlm()` + the slideshow
provider + mock TTS. `npm run worker -- --demo` renders a real MP4 with zero
external calls.

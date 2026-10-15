# Contributing to Shortwave

Thanks for helping make an open, self-hosted AI-drama studio. This guide gets you
from clone to a merged PR.

## Setup
```bash
git clone https://github.com/livingdream01/shortwave
cd shortwave
npm install
supabase start          # local Postgres + Auth + Mailpit (needs Docker)
supabase db reset       # apply migrations
cp .env.example .env.local
npm run dev             # portal at http://localhost:3040
```
No API keys? It runs in **demo mode** — `npm run worker -- --demo` produces a real
MP4 offline.

## Quality gate (must pass before a PR)
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## The three easy contribution paths

### Add a video provider
1. Create `lib/video/<name>.ts` exporting a `VideoProvider`
   (`{ name, generate(shot) }`) — see `lib/video/higgsfield.ts`.
2. Add config keys in `lib/config.ts` + `.env.example`.
3. Register it in the provider list in `worker/index.ts`.
4. Add a unit test with a mocked `fetch` (see `lib/video/higgsfield.test.ts`).

### Add a publishing connector
1. Create `lib/publish/<platform>.ts` implementing `Publisher`
   (`{ platform, publish(asset) }`) — see `lib/publish/instagram.ts`.
2. Register it in `lib/publish/registry.ts`.
3. Test payload building + the "never publish an unfinished container" invariant.

### Add a story format
1. Add the key to `Format` in `lib/types.ts`.
2. Add a `FormatPlaybook` in `lib/agent/niches.ts`.
3. It joins the arm space automatically.

## Conventions
- TypeScript strict; no `any` in exported signatures.
- Pure logic lives in `lib/` and is unit-tested; side effects are thin.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).
- Keep the policy guardrails: original IP only, no real-person likeness,
  `is_ai_generated=true`, caption disclosure.

## Pull requests
- One focused change per PR; fill the PR template.
- Green CI is required. Screenshots welcome for UI changes.
- Never commit secrets. `.env.local` is gitignored — keep it that way.

## Reporting bugs / ideas
Use GitHub Issues with the provided templates. For anything security-related, see
`SECURITY.md` (do not open a public issue).

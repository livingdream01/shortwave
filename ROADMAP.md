# Roadmap

Shortwave is an autonomous, bilingual AI-drama studio that writes, renders,
publishes and learns — self-hosted and open source.

The full plan lives in [`masterbook/15-masterplan.md`](masterbook/15-masterplan.md).
Highlights:

## Done
- Agent loop (scout · character-bible · writer · critic · storyboard · director) with a
  policy gate and a bounded rewrite loop.
- Five formats + a Thompson-sampling bandit over 675 arms.
- Video providers: fal · Higgsfield · Replicate · Remotion slideshow fallback.
- Remotion 9:16 render (real 1080×1920 H.264 MP4).
- Instagram publishing (container → poll → publish, AI disclosure, trial reels).
- Login portal (magic link) + encrypted token vault (AES-256-GCM, RLS).
- Unattended ops (boot · sweep · refresh · keepawake · alerts · health).
- 92 tests; lint/typecheck/build green.

## Next
- **Phase 1 — runs for anyone:** MCP server (drive it from Claude), one-command
  bootstrap, Docker path, docs site, CI.
- **Phase 2 — multi-platform:** TikTok + YouTube Shorts connectors, insights wired to
  the bandit, free/self-hosted open models.
- **Phase 3 — studio:** onboarding wizard, content pack, episode browser, scheduler UI.
- **Phase 4 — ecosystem:** template marketplace, provider SDK, optional hosted cloud.

## Not planned
Credential-based / unofficial automation (it bans accounts). We use official APIs only.

# Unattended Ops

The goal: **one consent, then nothing.** After you connect Instagram once, the
machine keeps the token alive and posts on schedule without you.

## The two jobs
| Job | Command | Cadence | Does |
|---|---|---|---|
| **Sweep** | `npm run sweep` | 3×/day (09:00, 15:00, 21:00) | refresh token → publish one episode → alert on failure |
| **Refresh** | `npm run refresh` | Mon + Thu 10:00 | extend the 60-day token so it never lapses from neglect |

Install (edit the path if your repo isn't at `/Users/mac/shortwave`):
```bash
mkdir -p ~/Library/LaunchAgents
cp scripts/launchd/io.shortwave.sweep.plist   ~/Library/LaunchAgents/
cp scripts/launchd/io.shortwave.refresh.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/io.shortwave.sweep.plist
launchctl load ~/Library/LaunchAgents/io.shortwave.refresh.plist
```
Check / unload:
```bash
launchctl list | grep shortwave
launchctl unload ~/Library/LaunchAgents/io.shortwave.sweep.plist
```
Logs land in `out/cron.sweep.log`, `out/cron.sweep.err`, `out/cron.refresh.*`.

> **The Mac must be awake.** Colima + Docker + Supabase must be running too.
> Add `caffeinate -s` as a login item, or point the worker at an always-on box
> later. If the machine sleeps through every run, nothing posts.

## Alerting
`lib/notify.ts` always appends to `out/alerts.log`; if `RESEND_API_KEY` and
`OPERATOR_EMAIL` are set it also **emails** you. Alerts fire on:
- token refresh failure / no account connected,
- a publish run that exits non-zero,
- a token within 7 days of expiry.

## Health
`GET /api/health` returns:
```json
{ "ok": true, "supabase": "ok", "tokenDaysLeft": 52,
  "lastPublishAt": "2026-10-13T09:00:03Z", "issues": [] }
```
Non-`ok` returns HTTP 503. Point an uptime pinger at it if you want a second
watchdog. `/connections` shows the token expiry per account.

## Safety rails
- Publishing uses **trial reels** by default (`worker/index.ts` sets
  `trial: true`), so experiments go to non-followers first — they never hit your
  main audience until they prove out. Remove that flag to post normally.
- Every post carries `is_ai_generated=true` and the caption disclosure.
- The publisher polls container status and **never publishes an unfinished
  container**; it respects Meta's 24h post limits.

## Failure playbook
| Alert | What to do |
|---|---|
| "no Instagram account connected" | Open `/connections`, connect Instagram. |
| "token refresh failed" | Re-connect once at `/connections`; check `SW_TOKEN_KEK` unchanged. |
| "publish run failed" | Read `out/cron.sweep.err` + `out/alerts.log`; usually a storage URL or rate limit. |
| Nothing runs | Mac asleep / Colima down / launchd not loaded (`launchctl list`). |

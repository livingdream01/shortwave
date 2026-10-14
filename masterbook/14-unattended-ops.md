# Unattended Ops

The goal: **one consent, then nothing.** After you connect Instagram once, the
machine keeps the token alive and posts on schedule without you.

## The jobs
| Job | Command | Cadence | Does |
|---|---|---|---|
| **Sweep** | `npm run sweep` | 3×/day (09:00, 15:00, 21:00) | refresh token → publish one episode → alert on failure |
| **Refresh** | `npm run refresh` | Mon + Thu 10:00 | extend the 60-day token so it never lapses from neglect |
| **Keep-awake** | `caffeinate -s` | always on (optional) | stops the Mac sleeping so the jobs always fire |

Each job is wrapped in `caffeinate -s`, so a run is never interrupted by sleep.

## Install / remove
```bash
bash scripts/install-launchd.sh              # sweep + refresh
bash scripts/install-launchd.sh --keepawake  # also keep the Mac awake
bash scripts/uninstall-launchd.sh            # remove all
```
The installer substitutes your repo path automatically, so it works anywhere.
Check status and logs:
```bash
launchctl list | grep shortwave
pmset -g assertions | grep caffeinate        # confirm keep-awake is asserting
tail -f out/cron.sweep.log out/alerts.log
```

> **Keep-awake note:** loaded keep-awake means the Mac stays awake (and drains
> faster **on battery** — keep it plugged in for overnight runs). Disable any time:
> `bash scripts/uninstall-launchd.sh` (removes all), or unload just it:
> `launchctl unload ~/Library/LaunchAgents/io.shortwave.keepawake.plist`.
>
> Colima + Docker + Supabase must be running at run time. Keep-awake stops the
> Mac sleeping, but not your other services — if you reboot, `supabase start`
> first (or add it to a login item).

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

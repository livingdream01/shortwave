# Runbooks

## Daily run (local cron via launchd)
Create `~/Library/LaunchAgents/io.shortwave.daily.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>io.shortwave.daily</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/npm</string>
    <string>run</string><string>worker</string><string>--</string><string>--publish</string>
  </array>
  <key>WorkingDirectory</key><string>/Users/mac/shortwave</string>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>15</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>21</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>StandardOutPath</key><string>/Users/mac/shortwave/out/cron.log</string>
  <key>StandardErrorPath</key><string>/Users/mac/shortwave/out/cron.err</string>
</dict></plist>
```
Load: `launchctl load ~/Library/LaunchAgents/io.shortwave.daily.plist`
Unload: `launchctl unload ~/Library/LaunchAgents/io.shortwave.daily.plist`

## Generate without publishing (dry run)
```
npm run worker -- --demo            # offline proof
npm run worker -- --format=heist    # live brain, no post
```

## Publish one reel
```
export SHORTWAVE_IG_USER_ID=...
export SHORTWAVE_IG_TOKEN=...
npm run worker -- --publish
```

## Rotate the Instagram token
1. `needsRefresh(expiresAt)` is true within 7 days of expiry.
2. The daily cron refreshes it automatically (`ensureFreshInstagramToken`), which
   re-seals and updates the `accounts` row. To rotate manually, re-run the
   **Connect Instagram** flow from `/connections`.
3. `/connections` shows the current token expiry per account.

## Troubleshoot
| Symptom | Likely cause | Fix |
|---|---|---|
| `Instagram container … is ERROR` | video URL not public / bad codec | check Supabase bucket is public; re-render H.264 |
| container never `FINISHED` | large file / slow upload | wait; `awaitReady` times out at 5 min |
| `HTTP 401` mid-publish | token expired | `assertUsable` throws; refresh token |
| `DEEPSEEK_API_KEY is not set` | env missing | fill `.env.local` or run `--demo` |
| one shot missing | provider 5xx | expected — falls back to slideshow; check `shotErrors` |
| `npm run` fails: command not found | broken shell PATH | `export PATH=/opt/homebrew/bin:/usr/bin:/bin:$PATH` |

## Health checks
```
npm run lint && npm run typecheck && npx vitest run && npm run build
```

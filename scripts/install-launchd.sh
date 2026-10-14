#!/usr/bin/env bash
# Install Shortwave's launchd jobs (sweep + refresh; keepawake with --keepawake).
#   bash scripts/install-launchd.sh              # sweep + refresh
#   bash scripts/install-launchd.sh --keepawake  # also keep the Mac awake
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENTS="$HOME/Library/LaunchAgents"
JOBS=(boot sweep refresh)
for a in "$@"; do [ "$a" = "--keepawake" ] && JOBS+=(keepawake); done

mkdir -p "$AGENTS" "$REPO/out"

for job in "${JOBS[@]}"; do
  src="$REPO/scripts/launchd/io.shortwave.$job.plist"
  dst="$AGENTS/io.shortwave.$job.plist"
  sed "s|__REPO__|$REPO|g" "$src" > "$dst"
  launchctl unload "$dst" 2>/dev/null || true
  launchctl load "$dst"
  echo "loaded io.shortwave.$job"
done

echo
echo "Installed jobs:"
launchctl list | grep shortwave || true
echo
echo "Logs: $REPO/out/cron.*.log and $REPO/out/boot.log"
case " ${JOBS[*]} " in
  *" keepawake "*) ;;
  *) echo "Tip: re-run with --keepawake so the Mac never sleeps through a run." ;;
esac

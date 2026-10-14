#!/usr/bin/env bash
# Remove all Shortwave launchd jobs.
set -euo pipefail

AGENTS="$HOME/Library/LaunchAgents"
for job in boot sweep refresh keepawake; do
  dst="$AGENTS/io.shortwave.$job.plist"
  if [ -f "$dst" ]; then
    launchctl unload "$dst" 2>/dev/null || true
    rm -f "$dst"
    echo "removed io.shortwave.$job"
  fi
done

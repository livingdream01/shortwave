#!/usr/bin/env bash
# Boot/login helper: bring up Colima (Docker) and the local Supabase stack so the
# scheduled sweep never silently stops after a reboot.
# Idempotent: safe to run at every login. Logs to out/boot.log.
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

mkdir -p "$REPO/out"
LOG="$REPO/out/boot.log"
log() { echo "$(date '+%F %T') $*" >>"$LOG"; }

log "boot-stack start"

# 1. Colima (Docker runtime)
if command -v colima >/dev/null 2>&1; then
  if colima status >/dev/null 2>&1; then
    log "colima already running"
  else
    log "starting colima"
    colima start >>"$LOG" 2>&1 || log "colima start failed"
  fi
fi

# 2. Wait for the Docker daemon (up to ~2 min)
for _ in $(seq 1 60); do
  if docker info >/dev/null 2>&1; then
    log "docker ready"
    break
  fi
  sleep 2
done

# 3. Local Supabase stack
cd "$REPO" || exit 1
if command -v supabase >/dev/null 2>&1; then
  if supabase status >/dev/null 2>&1; then
    log "supabase already running"
  else
    log "starting supabase"
    supabase start >>"$LOG" 2>&1 || log "supabase start failed"
  fi
fi

log "boot-stack done"

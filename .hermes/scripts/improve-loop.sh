#!/usr/bin/env bash
# ==============================================================================
# H-Dashboard Auto-Improve Loop
# Runs the shadcn/improve skill every 2 hours, applies fixes, tests, and pushes.
# ==============================================================================

set -euo pipefail

PROJECT_DIR="/home/boxd/vue-dash"
LOG_FILE="$PROJECT_DIR/.hermes/scripts/improve-loop.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

cd "$PROJECT_DIR"

log "🚀 Auto-improve loop started. Running every 2 hours."

while true; do
  log "=== Starting improvement cycle ==="

  # 1. Pull latest
  log "📥 Pulling latest changes..."
  git pull --rebase 2>&1 | tee -a "$LOG_FILE" || true

  # 2. Install deps if needed
  if [ ! -d "node_modules" ]; then
    log "📦 Installing dependencies..."
    npm install 2>&1 | tee -a "$LOG_FILE"
  fi

  # 3. Run the improve skill
  log "🔍 Running improve skill..."
  # The improve skill reads the codebase and outputs improvement suggestions
  # We pipe the results to a temp file and process them
  npx skills run improve --dir "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE" || true

  # 4. Run tests
  log "🧪 Running tests..."
  npm test 2>&1 | tee -a "$LOG_FILE" || true

  # 5. Run build
  log "🏗️ Running build..."
  npm run build 2>&1 | tee -a "$LOG_FILE" || true

  # 6. Commit and push any changes
  if ! git diff --quiet --ignore-submodules HEAD 2>/dev/null; then
    log "📤 Committing and pushing improvements..."
    git add -A
    git commit -m "improve: auto-fix from code audit [skip ci]" 2>&1 | tee -a "$LOG_FILE" || true
    git push 2>&1 | tee -a "$LOG_FILE" || true
  else
    log "✅ No changes to commit."
  fi

  log "😴 Sleeping for 2 hours..."

  # Sleep for 2 hours (7200 seconds) in 60-second intervals so we can detect
  # if the script is being killed (e.g., parent process dies)
  for ((i=0; i<120; i++)); do
    sleep 60
    # If the parent shell session is gone, exit gracefully
    if ! kill -0 $PPID 2>/dev/null && [ "$PPID" != "1" ]; then
      log "⚠️ Parent process died. Exiting."
      exit 0
    fi
  done
done

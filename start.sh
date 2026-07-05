#!/usr/bin/env bash
# One-command local startup for Job Radar (backend + frontend).
# Usage: ./start.sh   (from anywhere in the repo)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

BACKEND_LOG="$(mktemp)"
FRONTEND_LOG="$(mktemp)"

BACKEND_PID=""
FRONTEND_PID=""
CLEANED_UP=0

# npm/vite spawn a small process tree (npm -> sh -> node). A plain `kill $PID`
# only signals the top process and often leaves the rest running, so each
# service is launched with `setsid` (its own process group) and stopped by
# signaling the whole group with a negative PID.
cleanup() {
  [[ "$CLEANED_UP" -eq 1 ]] && return
  CLEANED_UP=1
  echo ""
  echo "Stopping Job Radar..."
  [[ -n "$BACKEND_PID" ]] && kill -TERM -- "-$BACKEND_PID" 2>/dev/null || true
  [[ -n "$FRONTEND_PID" ]] && kill -TERM -- "-$FRONTEND_PID" 2>/dev/null || true
  rm -f "$BACKEND_LOG" "$FRONTEND_LOG"
}
trap cleanup EXIT INT TERM

# --- Backend setup ---
if [[ ! -d "$BACKEND_DIR/.venv" ]]; then
  echo "Creating Python virtual environment..."
  python3 -m venv "$BACKEND_DIR/.venv"
  "$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

echo "Starting backend (FastAPI)..."
setsid bash -c "cd '$BACKEND_DIR' && ./.venv/bin/uvicorn app.main:app --reload" > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# --- Frontend setup ---
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

echo "Starting frontend (Vite)..."
setsid bash -c "cd '$FRONTEND_DIR' && npm run dev" > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# --- Wait for backend to respond ---
echo "Waiting for backend..."
for _ in $(seq 1 30); do
  if command -v curl >/dev/null 2>&1 && curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

# --- Wait for Vite to report its actual URL ---
echo "Waiting for frontend..."
FRONTEND_URL=""
for _ in $(seq 1 30); do
  FRONTEND_URL=$(grep -oE 'Local:[[:space:]]+http://[^[:space:]]+' "$FRONTEND_LOG" 2>/dev/null | awk '{print $2}' | head -1 || true)
  [[ -n "$FRONTEND_URL" ]] && break
  sleep 0.5
done

echo ""
echo "Job Radar is running:"
echo "  Backend:  http://127.0.0.1:8000"
if [[ -n "$FRONTEND_URL" ]]; then
  echo "  Frontend: $FRONTEND_URL"
else
  echo "  Frontend: still starting — check log at $FRONTEND_LOG"
fi
echo ""
echo "Press Ctrl+C to stop both servers."

wait

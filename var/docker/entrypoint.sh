#!/bin/sh
# Container entrypoint for the Nexora runtime (Render / Railway / any Docker
# host). Starts:
#   - the Temporal dev server, whose state lives in a SQLite file (headless:
#     no UI port, otherwise Render would route all traffic to the UI on 8233);
#   - the Temporal orchestrator worker;
#   - the NestJS API in the foreground, which opens the HTTP port Render needs.
set -ux

echo "=== NEXORA ENTRYPOINT ==="
echo "node: $(node --version 2>&1)"
echo "PORT=${PORT:-<non defini>}"
echo "backend main.js: $(ls -l /app/apps/backend/dist/apps/backend/src/main.js 2>&1)"

temporal server start-dev \
  --ip 127.0.0.1 \
  --port 7233 \
  --headless \
  --db-filename /tmp/temporal.db &

node --experimental-require-module /app/apps/orchestrator/dist/apps/orchestrator/src/main.js 2>&1 &
WORKER_PID=$!

echo "=== demarrage API (pid worker: $WORKER_PID) ==="
node --experimental-require-module /app/apps/backend/dist/apps/backend/src/main.js 2>&1
STATUS=$?
echo "=== API TERMINEE avec code $STATUS ==="
exit $STATUS

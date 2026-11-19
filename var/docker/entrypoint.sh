#!/bin/sh
# Container entrypoint for the Nexora runtime (Render / Railway / any Docker
# host). Starts:
#   - the Temporal dev server, whose state lives in a SQLite file, so scheduled
#     posts really run without hosting a Temporal cluster;
#   - the Temporal orchestrator worker;
#   - the NestJS API in the foreground, so the container reports the failure and
#     its logs as soon as the API stops (that is also what opens the HTTP port
#     Render waits for).
set -u

temporal server start-dev \
  --ip 0.0.0.0 \
  --port 7233 \
  --ui-port 8233 \
  --db-filename /tmp/temporal.db &

# The worker retries its connection until the dev server is up.
node --experimental-require-module /app/apps/orchestrator/dist/apps/orchestrator/src/main.js &

exec node --experimental-require-module /app/apps/backend/dist/apps/backend/src/main.js

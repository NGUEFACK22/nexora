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

# --headless is essential: the Temporal UI is a SvelteKit app that opens an
# HTTP port (8233). Render detects the first open port as the service's public
# port and would send all API traffic to the UI instead of the NestJS API.
temporal server start-dev \
  --ip 127.0.0.1 \
  --port 7233 \
  --headless \
  --db-filename /tmp/temporal.db &

# The worker retries its connection until the dev server is up.
node --experimental-require-module /app/apps/orchestrator/dist/apps/orchestrator/src/main.js &

exec node --experimental-require-module /app/apps/backend/dist/apps/backend/src/main.js

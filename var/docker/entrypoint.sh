#!/bin/sh
# Container entrypoint for the free Render plan (512 MB).
#
# The Temporal dev server + worker alone take ~250 MB, which pushed the total
# over the 512 MB limit and got the container OOM-killed before the API could
# bind a port. On this plan we only run the NestJS API; without TEMPORAL_ADDRESS
# the app uses the no-Temporal stub, so nothing is scheduled. Publishing still
# works for manual posts.
set -ux

echo "=== NEXORA ENTRYPOINT (sans Temporal) ==="
echo "node: $(node --version 2>&1)"
echo "PORT=${PORT:-<non defini>}"

# Node auto-sets a ~256 MB V8 heap in a 512 MB container, which is not enough
# for NestJS + Prisma + the AI libraries at boot. Leave ~110 MB for the native
# side so the cgroup limit is not hit.
export NODE_OPTIONS="--max-old-space-size=400"

node --experimental-require-module /app/apps/backend/dist/apps/backend/src/main.js 2>&1
STATUS=$?
echo "=== API TERMINEE avec code $STATUS ==="
exit $STATUS

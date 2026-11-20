# Nexora runtime container: backend API + Temporal orchestrator worker +
# Temporal dev server, all in one image (Render / Railway / any Docker host).
# The frontend is served by Vercel.
#
# Env vars (DATABASE_URL, REDIS_URL, JWT_SECRET, ...) come from the platform
# environment, never from a baked-in .env file (see .dockerignore).
FROM node:22.23.4-bookworm-slim

ENV NODE_ENV=production
# TEMPORAL_ADDRESS is intentionally NOT set: on the free plan there is no
# Temporal server, and the backend then uses its no-Temporal stub module.
# Set it in the platform environment (with a real server) to enable scheduling.

RUN apt-get update && apt-get install -y --no-install-recommends bash ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1

# Temporal CLI, used to run the dev server (SQLite) so posts really get
# published without hosting a full Temporal cluster.
RUN curl -sSf https://temporal.download/cli.sh | sh \
  && ln -sf /root/.temporalio/bin/temporal /usr/local/bin/temporal

WORKDIR /app

COPY . /app

RUN pnpm install --frozen-lockfile \
  && NODE_OPTIONS="--max-old-space-size=4096" node var/scripts/build-backend.js \
  && NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter ./apps/orchestrator run build \
  && node var/scripts/rewrite-dist-paths.js \
  && chmod +x var/docker/entrypoint.sh

EXPOSE 3000

CMD ["/bin/sh", "/app/var/docker/entrypoint.sh"]

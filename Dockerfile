# Backend + orchestrator container (the frontend is served by Vercel).
# Railway auto-detects this Dockerfile at the repo root; it also works on any
# Docker host. Env vars (DATABASE_URL, TEMPORAL_ADDRESS, JWT_SECRET, ...) come
# from the platform environment, never from a baked-in .env file.
FROM node:22.23.4-bookworm-slim

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends bash \
 && rm -rf /var/lib/apt/lists/*

RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1 pm2

WORKDIR /app

COPY . /app

RUN pnpm install \
 \
 && NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter ./apps/orchestrator run build

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.railway.cjs"]

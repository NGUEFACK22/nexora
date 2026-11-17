// Vercel serverless entry for the Nexora backend (NestJS).
// IMPORTANT: imports the COMPILED dist (built by `nest build` via vercel.json
// buildCommand) — @vercel/node cannot compile Nest decorators on the fly.
// Booted per request, cached across warm invocations.
process.env.SERVERLESS = 'true';

import serverless from 'serverless-http';

let cached: any;

export default async function handler(req: any, res: any) {
  cached = cached || serverless(await boot());
  return cached(req, res);
}

async function boot() {
  const { createNestApp } = await import(
    '../dist/apps/backend/src/main.js'
  );
  const nest = await createNestApp();
  await nest.init();
  // serverless-http needs the raw Express instance, not the Nest wrapper
  return (nest as any).getHttpAdapter().getInstance();
}

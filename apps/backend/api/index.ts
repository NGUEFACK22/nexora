// Vercel serverless entry for the Nexora backend (NestJS).
// Booted per request, cached across warm invocations.
process.env.SERVERLESS = 'true';

import serverless from 'serverless-http';
import { createNestApp } from '../src/main';

let cached: any;

export default async function handler(req: any, res: any) {
  cached = cached || serverless(await createNestApp());
  return cached(req, res);
}

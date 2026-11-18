// Vercel serverless entry for the Nexora backend (NestJS, compiled dist).
// Plain CommonJS on purpose: no TypeScript compilation on Vercel.
// The raw Express instance handles (req, res) directly — no serverless-http.
process.env.SERVERLESS = 'true';

const { createNestApp } = require('../dist/apps/backend/src/main.js');

let cached;

module.exports = async function handler(req, res) {
  cached = cached || (await createNestApp()).getHttpAdapter().getInstance();
  return cached(req, res);
};

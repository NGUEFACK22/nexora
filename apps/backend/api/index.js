// Vercel serverless entry for the Nexora backend (NestJS, compiled dist).
// Plain CommonJS on purpose: Vercel's TypeScript compilation resolves the
// tsconfig from cwd=/ and breaks. require() paths resolve relative to THIS
// file, which is immune to the working directory.
process.env.SERVERLESS = 'true';

const serverless = require('serverless-http');
const { createNestApp } = require('../dist/apps/backend/src/main.js');

let cached;

module.exports = async function handler(req, res) {
  cached = cached || serverless(await createNestApp());
  return cached(req, res);
};

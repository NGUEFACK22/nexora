// Vercel serverless entry for the Nexora backend (NestJS, compiled dist).
// Plain CommonJS on purpose: no TypeScript compilation on Vercel.
// The raw Express instance handles (req, res) directly - no serverless-http.
//
// The Nest app is created lazily inside the handler (not at import time) so a
// boot failure is caught and returned with its stack: without this, Vercel
// only shows its generic "A server error has occurred" page and the cause is
// invisible in the function logs.
process.env.SERVERLESS = 'true';

// The compiled dist is emitted with importHelpers, so almost every file requires
// tslib. Vercel traces the function bundle from this entry file: a static require
// here is what guarantees tslib is part of the deployment.
require('tslib');

let appPromise;

function getApp() {
  if (!appPromise) {
    const { createNestApp } = require('../dist/apps/backend/src/main.js');
    appPromise = createNestApp().then((app) =>
      app.getHttpAdapter().getInstance()
    );
  }
  return appPromise;
}

module.exports = async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('[backend] request failed', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify({
          error: {
            code: '500',
            message: (err && (err.stack || err.message)) || String(err),
          },
        })
      );
    }
    return undefined;
  }
};

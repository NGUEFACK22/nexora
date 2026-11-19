// Runs the Temporal server, the backend API and the Temporal orchestrator
// worker inside one container (Render / Railway / any Docker host).
// The frontend is served by Vercel.
module.exports = {
  apps: [
    {
      // Temporal dev server: keeps its state in a SQLite file so scheduled
      // posts actually run. Started first, the two other processes retry their
      // connection until it is up.
      name: 'temporal',
      script: 'temporal',
      args: 'server start-dev --ip 0.0.0.0 --port 7233 --ui-port 8233 --db-filename /tmp/temporal.db',
      autorestart: true,
      max_restarts: 20,
    },
    {
      name: 'backend',
      cwd: '/app/apps/backend',
      script: 'node',
      args: '--experimental-require-module ./dist/apps/backend/src/main.js',
      max_memory_restart: '1G',
    },
    {
      name: 'orchestrator',
      cwd: '/app/apps/orchestrator',
      script: 'node',
      args: '--experimental-require-module ./dist/apps/orchestrator/src/main.js',
      max_memory_restart: '1G',
    },
  ],
};

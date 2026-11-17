// Runs the backend API and the Temporal orchestrator inside one container
// (Railway / any Docker host). The frontend is served by Vercel.
module.exports = {
  apps: [
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

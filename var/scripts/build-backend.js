// Builds the backend with tsc, resolving every path from THIS file's
// location so the build works no matter what the current directory is
// (Vercel, Railway, local — same behaviour everywhere).
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const tsconfig = path.join(root, 'apps', 'backend', 'tsconfig.build.json');
const tscBin = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const backendDir = path.join(root, 'apps', 'backend');

const result = spawnSync(process.execPath, [tscBin, '-p', tsconfig], {
  stdio: 'inherit',
  cwd: backendDir,
});
process.exitCode = result.status || 0;

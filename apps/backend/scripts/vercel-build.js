// Build used by the Vercel deployment of the backend (see apps/backend/vercel.json).
//
// 1. Compile with tsc, exactly like the local build (var/scripts/build-backend.js).
// 2. Rewrite the @gitroom/* path aliases into relative paths so the emitted
//    JavaScript is runnable by plain Node (and traceable by Vercel).
//
// Every path is resolved from this file, so the script behaves the same on
// Vercel, on a VPS or locally, whatever the current directory is.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const backendDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendDir, '..', '..');
const tsconfig = path.join(backendDir, 'tsconfig.build.json');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const distDir = path.join(backendDir, 'dist');
const incrementalInfo = path.join(backendDir, 'tsconfig.tsbuildinfo');

if (!fs.existsSync(tscBin)) {
  console.error(`TypeScript not found at ${tscBin} (run pnpm install first)`);
  process.exit(1);
}

// A committed/stale tsbuildinfo makes tsc believe the output is up to date and
// skip emitting, which would deploy an empty or outdated dist.
if (fs.existsSync(incrementalInfo)) {
  fs.rmSync(incrementalInfo, { force: true });
}

const build = spawnSync(process.execPath, [tscBin, '-p', tsconfig], {
  stdio: 'inherit',
  cwd: backendDir,
});

if (build.status !== 0) {
  console.error('tsc failed, aborting the Vercel build');
  process.exit(build.status || 1);
}

const rewrite = spawnSync(
  process.execPath,
  [path.join(__dirname, 'rewrite-dist-paths.js')],
  { stdio: 'inherit', cwd: repoRoot }
);

if (rewrite.status !== 0) {
  console.error('dist alias rewrite failed, aborting the Vercel build');
  process.exit(rewrite.status || 1);
}

if (!fs.existsSync(path.join(distDir, 'apps', 'backend', 'src', 'main.js'))) {
  console.error(`Expected entrypoint missing: ${distDir}/apps/backend/src/main.js`);
  process.exit(1);
}

console.log('Backend build ready for serverless deployment');

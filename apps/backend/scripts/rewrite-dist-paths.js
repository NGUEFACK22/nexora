// The backend is compiled with `tsc`, which does NOT rewrite the TypeScript
// path aliases from tsconfig.base.json. The emitted files therefore still
// require('@gitroom/nestjs-libraries/...'), a package that does not exist on
// disk, so plain `node dist/apps/backend/src/main.js` (and the Vercel
// serverless function) fail with MODULE_NOT_FOUND.
//
// This script rewrites those aliases into the matching relative path inside
// the compiled dist tree, which makes the output runnable by Node and lets
// Vercel's dependency tracer (@vercel/nft) follow the whole module graph and
// bundle the third-party packages the backend actually uses.
//
// Layout produced by tsc (see apps/backend/tsconfig.json, rootDir is the repo
// root from tsconfig.base.json):
//   dist/apps/backend/src/...              <- @gitroom/backend/*
//   dist/libraries/{helpers,nestjs-libraries}/src/... <- @gitroom/<lib>/*
//
// Idempotent: files without @gitroom/ requires are left untouched.

const fs = require('fs');
const path = require('path');

// Optional argument, used by the tests to rewrite a copy of the dist tree.
const DIST = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'dist');

const ALIASES = {
  'nestjs-libraries': path.join(DIST, 'libraries', 'nestjs-libraries', 'src'),
  helpers: path.join(DIST, 'libraries', 'helpers', 'src'),
  backend: path.join(DIST, 'apps', 'backend', 'src'),
};

const ALIAS_RE = /require\(["']@gitroom\/([^"']+)["']\)/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function toRequirePath(specifier) {
  const slash = specifier.indexOf('/');
  const lib = slash === -1 ? specifier : specifier.slice(0, slash);
  const rest = slash === -1 ? '' : specifier.slice(slash + 1);

  const base = ALIASES[lib];
  if (!base || !rest) {
    throw new Error(`Unknown @gitroom alias: @gitroom/${specifier}`);
  }

  return { target: path.join(base, rest) };
}

function rewrite(file) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('@gitroom/')) {
    return 0;
  }

  let count = 0;
  const output = source.replace(ALIAS_RE, (_match, specifier) => {
    const { target } = toRequirePath(specifier);

    // Fail the build loudly instead of emitting a path that does not exist:
    // Node would then throw MODULE_NOT_FOUND at runtime, which is exactly the
    // failure this script exists to prevent.
    if (!fs.existsSync(`${target}.js`) && !fs.existsSync(target)) {
      throw new Error(
        `Alias target not found for @gitroom/${specifier}: ${target}.js`
      );
    }

    let relative = path.relative(path.dirname(file), target).split(path.sep).join('/');
    if (!relative.startsWith('.')) {
      relative = `./${relative}`;
    }

    count++;
    return `require("${relative}")`;
  });

  fs.writeFileSync(file, output);
  return count;
}

function main() {
  if (!fs.existsSync(DIST)) {
    throw new Error(`Compiled output not found: ${DIST} (run the build first)`);
  }

  const files = walk(DIST);
  let rewrittenFiles = 0;
  let rewrittenRequires = 0;

  for (const file of files) {
    const count = rewrite(file);
    if (count) {
      rewrittenFiles++;
      rewrittenRequires += count;
    }
  }

  // Nothing may be left: a remaining alias breaks the deployed function.
  const leftovers = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes('@gitroom/')) {
      leftovers.push(path.relative(DIST, file));
    }
  }

  if (leftovers.length) {
    throw new Error(
      `Unresolved @gitroom aliases remain in ${leftovers.length} file(s):\n` +
        leftovers.slice(0, 10).join('\n')
    );
  }

  console.log(
    `Rewrote ${rewrittenRequires} alias requires in ${rewrittenFiles} file(s) of ${path.relative(process.cwd(), DIST) || DIST}`
  );
}

main();

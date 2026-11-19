// Rewrites the "@gitroom/*" TypeScript path aliases of the compiled output into
// relative require() paths.
//
// tsc (and therefore `nest build`) leaves the aliases untouched, and the
// libraries/ folders have no package.json of their own, so nothing can resolve
// "@gitroom/..." at runtime under plain Node. The container runs `node
// dist/.../main.js`, so the emitted JavaScript must be self-contained.
//
// Usage: node var/scripts/rewrite-dist-paths.js [distRoot]
// Idempotent: a dist that is already rewritten is left as is.
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const distRoots = process.argv[2]
  ? [path.resolve(process.argv[2])]
  : [
      path.join(repoRoot, 'apps', 'backend', 'dist'),
      path.join(repoRoot, 'apps', 'orchestrator', 'dist'),
    ];

// Longest prefixes first so "@gitroom/backend" is not swallowed by a shorter
// prefix that happens to match.
const ALIASES = [
  ['@gitroom/nestjs-libraries/', 'libraries/nestjs-libraries/src/'],
  ['@gitroom/react/', 'libraries/react-shared-libraries/src/'],
  ['@gitroom/backend/', 'apps/backend/src/'],
  ['@gitroom/orchestrator/', 'apps/orchestrator/src/'],
  ['@gitroom/helpers/', 'libraries/helpers/src/'],
];

const REQUIRE_ALIAS = /require\("@gitroom\/([^"]+)"\)/g;

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && full.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function resolveTarget(distRoot, fromFile, aliasPath) {
  const fullAlias = `@gitroom/${aliasPath}`;
  const alias = ALIASES.find(([prefix]) => fullAlias.startsWith(prefix));
  if (!alias) {
    return null;
  }

  const [prefix, target] = alias;
  // The compiled tree mirrors the repository layout inside each dist root:
  // dist/apps/... and dist/libraries/... .
  const absolute = path.join(distRoot, target + fullAlias.slice(prefix.length));

  const candidates = [absolute, `${absolute}.js`, path.join(absolute, 'index.js')];
  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (!found) {
    return null;
  }

  let relative = path.relative(path.dirname(fromFile), found).replace(/\\/g, '/');
  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }
  return relative.replace(/\.js$/, '');
}

let total = 0;
const files = new Set();
const failures = [];

for (const distRoot of distRoots) {
  if (!fs.existsSync(distRoot)) {
    console.warn(`skip ${path.relative(repoRoot, distRoot)} (not built)`);
    continue;
  }

  for (const file of walk(distRoot, [])) {
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('@gitroom/')) {
      continue;
    }

    const rewritten = source.replace(REQUIRE_ALIAS, (match, aliasPath) => {
      const target = resolveTarget(distRoot, file, aliasPath);
      if (!target) {
        failures.push(`${path.relative(repoRoot, file)} -> @gitroom/${aliasPath}`);
        return match;
      }
      total++;
      return `require("${target}")`;
    });

    if (rewritten !== source) {
      fs.writeFileSync(file, rewritten);
      files.add(file);
    }
  }
}

if (failures.length) {
  console.error('Unresolved @gitroom aliases:');
  for (const failure of failures.slice(0, 20)) {
    console.error('  ' + failure);
  }
  process.exit(1);
}

console.log(
  `Rewrote ${total} alias require(s) in ${files.size} file(s) of ${distRoots
    .map((root) => path.relative(repoRoot, root))
    .join(', ')}`
);

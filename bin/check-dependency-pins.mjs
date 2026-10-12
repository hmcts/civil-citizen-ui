#!/usr/bin/env node

/**
 * Fail if package.json uses version ranges, its direct dependencies disagree
 * with the lockfile workspace, or resolved npm packages lack correctly
 * formatted SHA-512 checksum entries.
 * @remarks Direct dependencies must be exact (no ^, ~, >, <, *, x, or ||).
 *   Transitive packages are pinned by yarn.lock; each non-optional npm package
 *   must carry a Yarn SHA-512 checksum. Yarn verifies archive contents during
 *   installation; this script checks that the checksum entry is present and
 *   has the expected format.
 *   Optional/os-cpu packages may omit checksums — Yarn hides those hashes
 *   because the archive is not always fetched.
 * @see README.md#dependency-checks
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJsonPath = path.join(root, 'package.json');
const lockfilePath = path.join(root, 'yarn.lock');

const EXACT_VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const CHECKSUM = /^\d+\/[a-f0-9]{128}$/i;
const RANGE_HINT = /[\^~*xX]|>=|<=|>|<|\|\|| - /;

const errors = [];

/**
 * @param value
 * @returns Whether this is an allowed exact pin, npm alias to an exact pin, or a Yarn patch.
 */
function isAllowedSpecifier(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  if (value.startsWith('patch:') || value.startsWith('file:') || value.startsWith('link:') || value.startsWith('portal:') || value.startsWith('workspace:')) {
    return true;
  }
  const alias = value.match(/^npm:(@?[^@]+)@(.+)$/);
  if (alias) {
    return EXACT_VERSION.test(alias[2]) && !RANGE_HINT.test(alias[2]);
  }
  return EXACT_VERSION.test(value) && !RANGE_HINT.test(value);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
for (const section of ['dependencies', 'devDependencies', 'resolutions']) {
  const entries = pkg[section];
  if (!entries || typeof entries !== 'object') {
    errors.push(`package.json is missing ${section}`);
    continue;
  }
  for (const [name, value] of Object.entries(entries)) {
    if (!isAllowedSpecifier(value)) {
      errors.push(`${section}["${name}"] must be an exact version (got ${JSON.stringify(value)})`);
    }
  }
}

const lockfile = fs.readFileSync(lockfilePath, 'utf8');
const blocks = lockfile.split(/\n\n+/);
const workspaceHeader = `"${pkg.name}@workspace:.":`;
const workspaceBlock = blocks.find(block => block.startsWith(`${workspaceHeader}\n`));
if (!workspaceBlock) {
  errors.push(`yarn.lock is missing ${workspaceHeader}`);
} else {
  const lockedDependencies = new Map();
  let inDependencies = false;
  for (const line of workspaceBlock.split('\n')) {
    if (line === '  dependencies:') {
      inDependencies = true;
      continue;
    }
    if (!inDependencies) continue;
    if (/^ {2}\S/.test(line)) break;
    const match = line.match(/^ {4}(?:"([^"]+)"|([^:]+)): "([^"]+)"$/);
    if (!match) {
      errors.push(`Cannot parse workspace dependency: ${line}`);
      continue;
    }
    lockedDependencies.set(match[1] ?? match[2], match[3]);
  }

  const directDependencies = {...pkg.dependencies, ...pkg.devDependencies};
  for (const [name, version] of Object.entries(directDependencies)) {
    const expected = /^(?:npm|patch|file|link|portal|workspace):/.test(version) ? version : `npm:${version}`;
    if (lockedDependencies.get(name) !== expected) {
      errors.push(`yarn.lock workspace has ${JSON.stringify(lockedDependencies.get(name))} for ${name}; package.json requires ${JSON.stringify(expected)}`);
    }
  }
  for (const name of lockedDependencies.keys()) {
    if (!Object.hasOwn(directDependencies, name)) {
      errors.push(`yarn.lock workspace contains ${name}, which is absent from package.json`);
    }
  }
}

let checked = 0;
let optionalWithoutChecksum = 0;

for (const block of blocks) {
  const first = block.split('\n')[0] ?? '';
  if (!first.endsWith(':') || first.startsWith('#') || first.startsWith('__metadata')) {
    continue;
  }
  const languageName = (block.match(/\n {2}languageName: (.+)/) || [])[1];
  const linkType = (block.match(/\n {2}linkType: (.+)/) || [])[1];
  const checksum = (block.match(/\n {2}checksum: (.+)/) || [])[1];
  const conditions = (block.match(/\n {2}conditions: (.+)/) || [])[1];
  if (languageName !== 'node' || linkType !== 'hard') {
    continue;
  }
  if (conditions) {
    if (!checksum) {
      optionalWithoutChecksum += 1;
    } else if (!CHECKSUM.test(checksum)) {
      errors.push(`${first} has an invalid checksum`);
    }
    continue;
  }
  checked += 1;
  if (!checksum) {
    errors.push(`${first} is missing a SHA checksum`);
  } else if (!CHECKSUM.test(checksum)) {
    errors.push(`${first} has an invalid checksum`);
  }
}

if (checked < 1) {
  errors.push('yarn.lock contained no checksummed npm packages');
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`deps:check: ${error}`);
  }
  process.exit(1);
}

console.log(`deps:check: ${Object.keys(pkg.dependencies).length} dependencies, ${Object.keys(pkg.devDependencies).length} devDependencies, and ${Object.keys(pkg.resolutions).length} resolutions are exact pins.`);
console.log(`deps:check: ${checked} yarn.lock npm packages have SHA checksums (${optionalWithoutChecksum} optional/platform packages may omit a hash until fetched).`);

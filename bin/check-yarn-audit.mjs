#!/usr/bin/env node

/**
 * Fail on unreviewed security advisories or production deprecations, stale review
 * records, or any production security advisory.
 *
 * @remarks Pins and lockfile checksums do not replace a CVE scan. Production
 *   (`dependencies`) must stay clean. Dev/test toolchain findings may be
 *   listed in `yarn-audit-known-issues` after review — do not copy a line
 *   there just to go green. Production deprecation notices require a separate
 *   maintenance review and matching records, as in the Jenkins audit.
 * @see README.md#dependency-checks
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const knownIssuesPath = path.join(root, 'yarn-audit-known-issues');

/**
 * @param record - One Yarn `--json` NDJSON audit object
 * @returns Stable key: package name plus advisory id
 */
function advisoryKey(record) {
  const name = record?.value ?? '';
  const id = record?.children?.ID ?? '';
  return `${name}::${id}`;
}

function isDeprecation(record) {
  return record.children?.ID === `${record.value} (deprecation)`;
}

/**
 * @param text - Yarn `--json` stdout (NDJSON; may be empty)
 * @returns Parsed advisory records
 */
function parseAuditNdjson(text) {
  const records = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    records.push(JSON.parse(trimmed));
  }
  return records;
}

/**
 * @param records - Parsed advisories
 * @returns Map keyed by {@link advisoryKey}, retaining every dependency path
 */
function indexAdvisories(records) {
  const map = new Map();
  for (const record of records) {
    const key = advisoryKey(record);
    const grouped = map.get(key) ?? [];
    grouped.push(record);
    map.set(key, grouped);
  }
  return map;
}

// Re-review an accepted finding if its severity, affected versions or immediate
// dependency path changes, even when the advisory ID stays the same.
function reviewDetails(record) {
  const children = record.children;
  return JSON.stringify([
    children.Severity,
    children['Vulnerable Versions'],
    [...(children['Tree Versions'] ?? [])].sort(),
    [...(children.Dependents ?? [])].sort(),
  ]);
}

function runYarnAudit(extraArgs, includeDeprecations = false) {
  const yarnPath = path.join(root, '.yarn/releases/yarn-4.18.1.cjs');
  const deprecationArgs = includeDeprecations ? [] : ['--no-deprecations'];
  const result = spawnSync(process.execPath, [yarnPath, 'npm', 'audit', '--recursive', '--json', ...deprecationArgs, ...extraArgs], {
    cwd: root,
    encoding: 'utf8',
    // Audit talks to the npm registry.
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) {
    throw result.error;
  }
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  // Yarn exits 1 when any report exists; that is expected. Other codes are fatal.
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`yarn npm audit failed (exit ${result.status}): ${stderr || stdout}`);
  }
  const records = parseAuditNdjson(stdout);
  if (result.status === 1 && records.length === 0) {
    throw new Error(`yarn npm audit failed without advisory records: ${stderr || 'no output'}`);
  }
  for (const record of records) {
    if (typeof record?.value !== 'string'
      || !['string', 'number'].includes(typeof record?.children?.ID)
      || typeof record?.children?.Severity !== 'string'
      || typeof record?.children?.Issue !== 'string') {
      throw new Error(`yarn npm audit returned a non-advisory record: ${JSON.stringify(record)}`);
    }
  }
  return records;
}

function formatRecord(record) {
  const id = record.children?.ID;
  const severity = record.children?.Severity;
  const issue = record.children?.Issue;
  const dependents = record.children?.Dependents ?? [];
  return `  - ${record.value} [${severity}] ${id} (dependents: ${dependents.join(', ') || 'none reported'}): ${issue}`;
}

const errors = [];

// Include notices in the production scan so Jenkins-only maintenance failures
// are caught here too. Only Yarn's exact deprecation IDs are separated out.
const productionReport = runYarnAudit(['--environment', 'production'], true);
const production = productionReport.filter(record => !isDeprecation(record));
const productionDeprecations = productionReport.filter(isDeprecation);
if (production.length > 0) {
  errors.push('Production dependency tree has security advisories (must be empty — do not allowlist these):');
  for (const record of production) {
    errors.push(formatRecord(record));
  }
}

const knownText = fs.existsSync(knownIssuesPath) ? fs.readFileSync(knownIssuesPath, 'utf8') : '';
const known = indexAdvisories(parseAuditNdjson(knownText));
// Retain the full-tree security scan: dev-only findings need review even though
// they do not appear in Jenkins's production-only report.
const securityRecords = runYarnAudit([]);
const current = indexAdvisories([...securityRecords, ...productionDeprecations]);

const unexpected = [];
const changed = [];
const stale = [];
for (const [key, records] of current) {
  const accepted = known.get(key);
  if (!accepted) {
    unexpected.push(...records);
    continue;
  }
  const unmatched = [...accepted];
  for (const record of records) {
    const match = unmatched.findIndex(item => reviewDetails(item) === reviewDetails(record));
    if (match === -1) {
      changed.push(record);
    } else {
      unmatched.splice(match, 1);
    }
  }
  stale.push(...unmatched);
}
if (unexpected.length > 0) {
  errors.push('New audit findings are not in yarn-audit-known-issues (review toolchain findings and production deprecations; never allowlist production security advisories):');
  for (const record of unexpected) {
    errors.push(formatRecord(record));
  }
}
if (changed.length > 0) {
  errors.push('Reviewed audit findings changed severity, affected versions or dependency path (review and update the recorded lines):');
  for (const record of changed) {
    errors.push(formatRecord(record));
  }
}

for (const [key, records] of known) {
  if (!current.has(key)) {
    stale.push(...records);
  }
}
if (stale.length > 0) {
  errors.push('yarn-audit-known-issues lists audit findings Yarn no longer reports (remove the stale lines):');
  for (const record of stale) {
    errors.push(formatRecord(record));
  }
}

if (errors.length > 0) {
  console.error(`deps:audit: ${errors.join('\n')}`);
  process.exit(1);
}

console.log(`deps:audit: no production security advisories; ${securityRecords.length} accepted toolchain security advisories and ${productionDeprecations.length} reviewed production deprecations match yarn-audit-known-issues.`);

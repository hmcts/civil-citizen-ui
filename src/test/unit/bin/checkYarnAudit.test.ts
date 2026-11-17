import {spawnSync} from 'child_process';
import {copyFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import {join, resolve} from 'path';

jest.retryTimes(0);

interface Finding {
  value: string;
  children: {
    ID: string | number;
    Issue: string;
    Severity: string;
    'Vulnerable Versions': string;
    'Tree Versions': string[];
    Dependents: string[];
  };
}

const finding = (name: string, id: string | number, dependent: string): Finding => ({
  value: name,
  children: {
    ID: id,
    Issue: 'Fixture audit finding',
    Severity: 'moderate',
    'Vulnerable Versions': '1.0.0',
    'Tree Versions': ['1.0.0'],
    Dependents: [dependent],
  },
});

describe('dependency audit command', () => {
  let directory: string;
  const notice = finding('trace-fixture', 'trace-fixture (deprecation)', 'sdk@virtual:current#npm:1.0.0');
  const devSecurity = finding('merge-fixture', 12345, 'test-runner@npm:1.0.0');

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'cui-audit-policy-'));
    mkdirSync(join(directory, 'bin'));
    mkdirSync(join(directory, '.yarn', 'releases'), {recursive: true});
    copyFileSync(resolve(__dirname, '../../../../bin/check-yarn-audit.mjs'), join(directory, 'bin/check-yarn-audit.mjs'));
    // Substitute only Yarn's registry response. Run the real audit CLI as a
    // subprocess, including its production/full-tree selection and exit status.
    writeFileSync(join(directory, '.yarn/releases/yarn-4.18.1.cjs'), `
      const fs = require('fs');
      const path = require('path');
      const root = path.resolve(__dirname, '../..');
      const args = process.argv.slice(2);
      let records = JSON.parse(fs.readFileSync(path.join(root,
        args.includes('production') ? 'production.json' : 'full.json'), 'utf8'));
      if (args.includes('--no-deprecations')) {
        records = records.filter(record => record.children.ID !== record.value + ' (deprecation)');
      }
      if (records.length) console.log(records.map(record => JSON.stringify(record)).join('\\n'));
      process.exit(records.length ? 1 : 0);
    `);
  });

  afterEach(() => {
    rmSync(directory, {recursive: true, force: true});
  });

  function audit(production: Finding[], full: Finding[], known: Finding[]) {
    writeFileSync(join(directory, 'production.json'), JSON.stringify(production));
    writeFileSync(join(directory, 'full.json'), JSON.stringify(full));
    writeFileSync(join(directory, 'yarn-audit-known-issues'), known.map(record => JSON.stringify(record)).join('\n'));
    return spawnSync(process.execPath, [join(directory, 'bin/check-yarn-audit.mjs')], {encoding: 'utf8'});
  }

  it('accepts reviewed production notices and dev-only security findings in their respective scans', () => {
    const devNotice = finding('dev-fixture', 'dev-fixture (deprecation)', 'test-runner@npm:1.0.0');
    const result = audit([notice], [notice, devSecurity, devNotice], [notice, devSecurity]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('no production security advisories');
    expect(result.stdout).toContain('1 accepted toolchain security advisories and 1 reviewed production deprecations');
  });

  it('fails for a production deprecation missing from the reviewed records', () => {
    const result = audit([notice], [notice], []);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('New audit findings');
    expect(result.stderr).toContain(notice.children.ID);
  });

  it('fails when the recorded deprecation has an outdated dependency path', () => {
    const oldNotice = {...notice, children: {...notice.children, Dependents: ['sdk@virtual:old#npm:1.0.0']}};
    const result = audit([notice], [notice], [oldNotice]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('changed severity, affected versions or dependency path');
    expect(result.stderr).toContain('sdk@virtual:current#npm:1.0.0');
  });

  it.each([notice, devSecurity])('rejects a stale reviewed finding: $value', (stale) => {
    const result = audit([], [], [stale]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('remove the stale lines');
  });

  it.each([12345, 'GHSA-fixture (deprecation)'])('never permits a reviewed production security advisory: %s', (id) => {
    const security = finding('production-fixture', id, 'runtime@npm:1.0.0');
    security.children.Issue = 'A security issue mentioning deprecation';
    const result = audit([security, notice], [security, notice], [security, notice]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Production dependency tree has security advisories');
    expect(result.stderr).toContain('production-fixture');
  });

  it('continues to reject unreviewed dev-only security findings', () => {
    const result = audit([], [devSecurity], []);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('New audit findings');
    expect(result.stderr).toContain('merge-fixture');
  });
});

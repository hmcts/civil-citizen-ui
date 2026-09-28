const {normalise, workerPlan, verifySelection, reconcile} = require('../../../../bin/functional-baseline');

const row = (title = 'Feature: Journey', skipped = false) => ({file: 'src/test/functionalTests/tests/ui_tests/example.js', title, skipped, tags: ['@civil-citizen-pr', '@civil-citizen-master', '@thin-full-stack']});
const report = tests => ({results: [{file: '/src/test/functionalTests/tests/ui_tests/example.js', tests}]});
const result = (title = 'Feature @civil-citizen-pr: Journey @thin-full-stack', status = 'pass') => ({fullTitle: title, pass: status === 'pass', fail: status === 'fail', pending: status === 'pending', skipped: status === 'excluded'});

describe('Historical functional baseline', () => {
  it('keeps skipped baseline files and excludes unrelated suites from worker allocation', () => {
    const active = row();
    const skipped = {...row('Skipped feature: Existing skip', true), file: 'src/test/functionalTests/tests/skipped.js'};
    const unrelated = {...row('Nightly: Other'), file: 'src/test/functionalTests/tests/nightly.js', tags: ['@civil-citizen-nightly']};
    const plan = workerPlan({scenarios: [skipped, active, {...active, title: 'Feature: Second'}, unrelated]}, 'pr');
    expect(plan.files).toEqual([active.file, skipped.file]);
    expect(plan.workers).toBeGreaterThanOrEqual(13);
  });

  it.each(['pr', 'master'])('gives every %s baseline file its own worker', pipeline => {
    const baseline = require('../../../../docs/functional-baseline.json');
    const expectedFiles = new Set(baseline.scenarios.filter(row => row.tags.includes(`@civil-citizen-${pipeline}`)).map(row => row.file));
    const plan = workerPlan(baseline, pipeline);
    expect(new Set(plan.files)).toEqual(expectedFiles);
    expect(plan.workers).toBeGreaterThanOrEqual(expectedFiles.size);
  });

  it('ignores routing metadata and spacing when comparing identities', () => {
    expect(normalise('Feature @ui-example : Journey  @thin-full-stack')).toBe('Feature: Journey');
    expect(() => verifySelection({scenarios: [row()]}, [row()])).not.toThrow();
  });

  it.each([
    ['omitted', []],
    ['added', [row(), row('Feature: Added')]],
    ['duplicated', [row(), row()]],
    ['newly skipped', [row('Feature: Journey', true)]],
    ['unmigrated', [{...row(), tags: ['@civil-citizen-pr', '@civil-citizen-master']}]],
  ])('rejects %s baseline scenarios', (_name, current) => {
    expect(() => verifySelection({scenarios: [row()]}, current)).toThrow();
  });

  it('accounts for existing skips while ignoring grep-excluded non-baseline tests', () => {
    const evidence = reconcile([row(), row('Feature: Disabled', true)], [report([result(), result('Feature: Disabled', 'pending'), result('Nightly: Other', 'excluded')])]);
    expect(evidence).toMatchObject({selected: 2, passed: 1, failed: 0, skipped: 1, errors: []});
  });

  it.each([
    ['missing', []],
    ['duplicated', [result(), result()]],
    ['failed', [result(undefined, 'fail')]],
    ['unexpectedly skipped', [result(undefined, 'pending')]],
    ['unexpectedly executed', [result(), result('Nightly: Other')]],
  ])('rejects %s execution results', (_name, tests) => {
    expect(reconcile([row()], [report(tests)]).errors.length).toBeGreaterThan(0);
  });
});

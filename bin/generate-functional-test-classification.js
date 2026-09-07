#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outputFile = path.join(repoRoot, 'docs/functional-test-scenario-classification.csv');
const assertionOutputFile = path.join(repoRoot, 'docs/functional-test-assertion-classification.csv');

const safeUrl = 'http://localhost';
[
  'TEST_URL',
  'URL',
  'SERVICE_AUTH_PROVIDER_API_BASE_URL',
  'CCD_DATA_STORE_URL',
  'DM_STORE_URL',
  'IDAM_API_URL',
  'IDAM_TEST_SUPPORT_API_URL',
  'IDAM_WEB_URL',
  'CIVIL_SERVICE_URL',
  'WA_TASK_MGMT_URL',
  'AAC_API_URL',
].forEach(name => {
  process.env[name] ||= safeUrl;
});

const {
  walk,
  collectScenarios,
} = require('../src/test/e2e-documentation/generator/support/data-gen-utils');

const TARGETS = {
  RETAINED_FULL_STACK: 'retained-thin-full-stack',
  MOCKED_FUNCTIONAL: 'mocked-functional-browser',
  SETUP: 'setup-only-not-coverage',
};

const retainedThinFullStackScenarios = new Set([
  'bundles/cp_LiPvLiP_bundles_small_claims_tests.js#1',
  'case-struck-out/cp_LiPvLiP_case_struck_out_fast_track_tests.js#1',
  'create-claim/IndividualvsIndividual_tests.js#1',
  'defendant-linking/defendantLinkingThroughCUI_tests.js#1',
  'ga/LiPvLiP_GA_DismissAnOrder_tests.js#1',
  'hearings/cp_LiPvLiP_hearing_fee_tests_fast_track_tests.js#2',
  'noc/LipVLR_NoC_e2e_tests.js#1',
  'qm/qm_Hearing_LiPvLiP_followUp_tests.js#1',
]);

const retainedObservableAssertions = new Map([
  ['bundles/cp_LiPvLiP_bundles_small_claims_tests.js#1', /viewBundlePage\.verifyPageContent/],
  ['case-struck-out/cp_LiPvLiP_case_struck_out_fast_track_tests.js#1', /verifyNotificationTitleAndContent/],
  ['create-claim/IndividualvsIndividual_tests.js#1', /createGASteps\.askForMoreTimeCourtOrderGA/],
  ['defendant-linking/defendantLinkingThroughCUI_tests.js#1', /ResponseSteps\.AssignCaseToLipSupportingBothJourneys/],
  ['ga/LiPvLiP_GA_DismissAnOrder_tests.js#1', /verifyNotificationTitleAndContent/],
  ['hearings/cp_LiPvLiP_hearing_fee_tests_fast_track_tests.js#2', /api\.assertEmailSent/],
  ['noc/LipVLR_NoC_e2e_tests.js#1', /api\.checkUserCaseAccess/],
  ['qm/qm_Hearing_LiPvLiP_followUp_tests.js#1', /ResponseSteps\.verifyClosedQuery/],
]);
const domainRules = {
  bundles: ['Document generation and persistence must be observed through CCD and document services.', 'CCD, Camunda, document management', 'documents'],
  'case-offline': ['The assertion depends on a genuine CCD state transition and workflow completion.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  'case-progression': ['The order and dashboard state are produced by genuine CCD/Camunda processing.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  'case-struck-out': ['The struck-out state and resulting notifications depend on real scheduled workflow processing.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  'create-claim': ['Claim issue may include payment, workflow, assignment and GA state; only the selected representative cross-service assertion is retained.', 'Civil Service, CCD, Camunda, payments, role assignment, General Applications', 'create-claim'],
  'deadline-extension': ['The response deadline must be persisted and observed through the real case workflow.', 'Civil Service, CCD, Camunda', 'responses'],
  'defendant-linking': ['Defendant linking exercises real case and role-assignment wiring.', 'Civil Service, CCD, role assignment', 'assignment'],
  'discontinue-claim': ['Discontinuance requires a real CCD transition and downstream workflow effects.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  dj: ['Default judgment requires real case state, payment/eligibility rules and workflow completion.', 'Civil Service, CCD, Camunda', 'judgments'],
  'full-admit': ['The response and repayment outcome must be persisted through real CCD/Camunda processing.', 'Civil Service, CCD, Camunda', 'responses'],
  ga: ['General Application creation and progression is a separate real cross-service workflow.', 'Civil Service, CCD, Camunda, General Applications', 'general-applications'],
  'ga-welsh': ['Welsh General Application content and state must be persisted through the real GA workflow.', 'Civil Service, CCD, Camunda, General Applications', 'general-applications'],
  hearings: ['Hearing fee, evidence or trial-arrangement state requires real payment and case-processing services.', 'Civil Service, CCD, Camunda, payments, document management', 'hearings'],
  'intermediate-track': ['Track allocation and subsequent case progression require genuine CCD/Camunda state.', 'Civil Service, CCD, Camunda', 'track-progression'],
  jba: ['Judgment by admission depends on real response, judgment and case-state processing.', 'Civil Service, CCD, Camunda', 'judgments'],
  'judgment-buffer': ['Judgment-buffer and scheduler outcomes require genuine asynchronous workflow execution.', 'Civil Service, CCD, Camunda', 'judgments'],
  mediation: ['Mediation referral and party outcomes require real case transitions and asynchronous processing.', 'Civil Service, CCD, Camunda, mediation', 'mediation'],
  'multi-track': ['Track allocation and subsequent case progression require genuine CCD/Camunda state.', 'Civil Service, CCD, Camunda', 'track-progression'],
  noc: ['Notice of Change exercises real organisation, role-assignment and CCD case access.', 'Civil Service, CCD, role assignment', 'assignment'],
  'part-admit': ['Part-admission and repayment outcomes require real response and case-state processing.', 'Civil Service, CCD, Camunda', 'responses'],
  payments: ['Payment completion and resulting case state require the real payment provider and workflow.', 'Civil Service, CCD, Camunda, payments', 'payments'],
  qm: ['Query Management creation, routing and responses require real CCD/WA integration.', 'Civil Service, CCD, Work Allocation', 'query-management'],
  'reject-all': ['Rejection, intention and mediation outcomes require real response and workflow processing.', 'Civil Service, CCD, Camunda', 'responses'],
  rfr: ['Request-for-reconsideration creation and resulting state require real case workflow processing.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  'settle-claim': ['Settlement must update the real CCD case and downstream tasks/notifications.', 'Civil Service, CCD, Camunda, Work Allocation', 'state-transitions'],
  'upload-evidence': ['Evidence persistence and case progression require real document and case services.', 'Civil Service, CCD, document management', 'documents'],
  welsh: ['Welsh-language case data, documents and translation workflow must be observed across real services.', 'Civil Service, CCD, Camunda, document management', 'welsh'],
};

const migrationTicketByDomain = {
  bundles: 'DTSCCI-6259',
  'case-offline': 'DTSCCI-6259',
  'case-progression': 'DTSCCI-6259',
  'case-struck-out': 'DTSCCI-6259',
  'create-claim': 'DTSCCI-6156',
  'deadline-extension': 'DTSCCI-6259',
  'defendant-linking': 'DTSCCI-6260',
  'discontinue-claim': 'DTSCCI-6258',
  dj: 'DTSCCI-6258',
  'full-admit': 'DTSCCI-6258',
  ga: 'DTSCCI-6260',
  'ga-welsh': 'DTSCCI-6260',
  hearings: 'DTSCCI-6259',
  'intermediate-track': 'DTSCCI-6261',
  jba: 'DTSCCI-6258',
  'judgment-buffer': 'DTSCCI-6258',
  mediation: 'DTSCCI-6258',
  'multi-track': 'DTSCCI-6261',
  noc: 'DTSCCI-6260',
  'part-admit': 'DTSCCI-6258',
  payments: 'DTSCCI-6259',
  qm: 'DTSCCI-6260',
  'reject-all': 'DTSCCI-6258',
  rfr: 'DTSCCI-6259',
  'settle-claim': 'DTSCCI-6258',
  'upload-evidence': 'DTSCCI-6259',
  welsh: 'DTSCCI-6261',
};

function relativeTestPath(filePath) {
  return filePath.replace('src/test/functionalTests/tests/ui_tests/', '');
}

function classify(scenario, scenarioId) {
  const file = relativeTestPath(scenario.filePath);
  const domain = file.split('/')[0];

  if (retainedThinFullStackScenarios.has(scenarioId)) {
    return {
      target: TARGETS.RETAINED_FULL_STACK,
      reason: `${domainRules[domain][0]} This exception retains only the observable cross-service assertion; deterministic UI assertions must still migrate.`,
      services: domainRules[domain][1],
      owner: 'DTSCCI-5974 reviewed exception; deterministic assertions owned by DTSCCI-6133',
      batch: 'DTSCCI-5974 retained exception plus DTSCCI-6133 assertion split',
      secondaryTargets: 'mocked-functional-browser for deterministic CUI behaviour; contract-sufficiency evidence for material mocked boundaries',
    };
  }

  const rule = domainRules[domain];
  if (!rule) {
    throw new Error(`No classification rule for ${file}`);
  }

  return {
    target: TARGETS.MOCKED_FUNCTIONAL,
    reason: 'Migration required: keep the functional browser journey and replace CUI-facing business dependencies with deterministic test doubles. Existing real-service setup is not retention evidence.',
    services: 'CUI, browser, Redis and scenario-driven test doubles; no real CCD or Camunda',
    owner: `${migrationTicketByDomain[domain] || 'DTSCCI-6262'} ${rule[2]} migration batch`,
    batch: `${migrationTicketByDomain[domain] || 'DTSCCI-6262'} ${rule[2]}`,
    secondaryTargets: 'contract-sufficiency evidence protects important mocked boundaries; no production application-logic changes',
  };
}

function classifyMaterialStep(step, source, scenarioTarget, scenarioId) {
  if (source !== 'scenario') {
    return {
      target: TARGETS.SETUP,
      rationale: 'Hook activity creates or cleans data. It is test setup, not evidence that the asserted behaviour requires a real stack.',
    };
  }

  if (scenarioTarget === TARGETS.RETAINED_FULL_STACK && retainedObservableAssertions.get(scenarioId)?.test(step)) {
    return {
      target: TARGETS.RETAINED_FULL_STACK,
      rationale: 'Candidate observable cross-service assertion. Retain only after DTSCCI-5974 review confirms mocked functional coverage cannot provide equivalent confidence.',
    };
  }

  if (/^(api|noc|qm|wa)\./i.test(step)) {
    if (/\b(assert|check|verify|retrieve)/i.test(step)) {
      return scenarioTarget === TARGETS.RETAINED_FULL_STACK
        ? {target: TARGETS.RETAINED_FULL_STACK, rationale: 'Candidate observable service-state assertion; retain only after DTSCCI-5974 review confirms mocked functional coverage cannot provide equivalent confidence.'}
        : {target: TARGETS.MOCKED_FUNCTIONAL, rationale: 'Keep the functional journey but replace this direct real-service check with the CUI-visible result or deterministic mocked-boundary assertion. Contract sufficiency is supporting evidence, not the functional-test destination.'};
    }
    return {
      target: TARGETS.SETUP,
      rationale: 'Direct API action is setup or orchestration. Replace it with deterministic fixture/state setup for migrated coverage; it is not itself a browser assertion.',
    };
  }

  return {
    target: TARGETS.MOCKED_FUNCTIONAL,
    rationale: 'Browser-visible navigation, form, session or rendered content belongs in the real-CUI reduced stack with deterministic downstream responses.',
  };
}

function escapeCsv(value) {
  const string = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  return `"${string.replace(/"/g, '""')}"`;
}

function collectInventory() {
  const root = path.join(repoRoot, 'src/test/functionalTests/tests/ui_tests');
  const files = walk(root).filter(file => /_tests?\.js$/i.test(file));
  const declared = files.flatMap(file => collectScenarios(file, 'ui'));
  const active = declared.filter(scenario => !scenario.skipped);
  const ordinalByFile = new Map();

  const assertionRows = [];
  const rows = active.map(scenario => {
    const file = relativeTestPath(scenario.filePath);
    const ordinal = (ordinalByFile.get(file) || 0) + 1;
    ordinalByFile.set(file, ordinal);
    const scenarioId = `${file}#${ordinal}`;
    const classification = classify(scenario, scenarioId);
    const pipeline = scenario.tags
      .filter(tag => ['@civil-citizen-pr', '@civil-citizen-master', '@civil-citizen-nightly'].includes(tag))
      .map(tag => tag.replace('@civil-citizen-', ''))
      .join(';') || 'group/on-demand only';
    const sourcedSteps = [
      ...(scenario.beforeSuiteSteps || []).map(step => ({step, source: 'feature hook'})),
      ...(scenario.beforeSteps || []).map(step => ({step, source: 'scenario hook'})),
      ...(scenario.collectedSteps || []).map(step => ({step, source: 'scenario'})),
    ];
    const materialSteps = sourcedSteps.map(({step}) => step);
    (sourcedSteps.length ? sourcedSteps : [{step: 'Scenario-local browser assertion (source inspection required during migration)', source: 'scenario'}])
      .forEach(({step, source}, index) => {
        const decision = classifyMaterialStep(step, source, classification.target, scenarioId);
        assertionRows.push({
          id: `${scenarioId}.a${index + 1}`,
          scenarioId,
          file,
          feature: scenario.featureName,
          scenario: scenario.testName,
          source,
          materialStep: step,
          target: decision.target,
          rationale: decision.rationale,
          deliveryBatch: classification.batch,
          owner: classification.owner,
        });
      });

    return {
      id: scenarioId,
      file,
      feature: scenario.featureName,
      scenario: scenario.testName,
      pipeline,
      target: classification.target,
      owner: classification.owner,
      services: classification.services,
      materialAssertions: materialSteps.join('; ') || 'Scenario-local Codecept/browser assertions; inspect source when migrating',
      rationale: classification.reason,
      deliveryBatch: classification.batch,
      secondaryTargets: classification.secondaryTargets || 'none',
      executionDecision: classification.target === TARGETS.RETAINED_FULL_STACK ? 'proposed-thin-full-stack' : 'migrate-to-mocked-functional',
    };
  });

  rows.sort((left, right) => left.id.localeCompare(right.id));
  assertionRows.sort((left, right) => left.id.localeCompare(right.id));
  return { declared, active, rows, assertionRows };
}

function renderCsv(rows) {
  const headings = [
    'id',
    'file',
    'feature',
    'scenario',
    'pipeline',
    'target',
    'coverage owner',
    'real services / boundary',
    'material assertions / helper steps',
    'classification rationale',
    'delivery batch',
    'secondary assertion targets',
    'proposed execution decision',
  ];
  const keys = ['id', 'file', 'feature', 'scenario', 'pipeline', 'target', 'owner', 'services', 'materialAssertions', 'rationale', 'deliveryBatch', 'secondaryTargets', 'executionDecision'];
  return [
    headings.map(escapeCsv).join(','),
    ...rows.map(row => keys.map(key => escapeCsv(row[key])).join(',')),
    '',
  ].join('\n');
}

function renderAssertionCsv(rows) {
  const headings = ['assertion id', 'scenario id', 'file', 'feature', 'scenario', 'source', 'material step', 'target layer', 'rationale', 'delivery batch', 'coverage owner'];
  const keys = ['id', 'scenarioId', 'file', 'feature', 'scenario', 'source', 'materialStep', 'target', 'rationale', 'deliveryBatch', 'owner'];
  return [headings.map(escapeCsv).join(','), ...rows.map(row => keys.map(key => escapeCsv(row[key])).join(',')), ''].join('\n');
}

const { declared, active, rows, assertionRows } = collectInventory();
const csv = renderCsv(rows);
const assertionCsv = renderAssertionCsv(assertionRows);
const checkMode = process.argv.includes('--check');

if (rows.filter(row => row.target === TARGETS.RETAINED_FULL_STACK).length !== retainedThinFullStackScenarios.size) {
  throw new Error('Every retained thin full-stack exception must resolve to one active scenario.');
}
const retainedAssertionScenarioIds = new Set(assertionRows
  .filter(row => row.target === TARGETS.RETAINED_FULL_STACK)
  .map(row => row.scenarioId));
const missingRetainedAssertions = [...retainedThinFullStackScenarios]
  .filter(scenarioId => !retainedAssertionScenarioIds.has(scenarioId));
if (missingRetainedAssertions.length) {
  throw new Error(`Retained scenarios lack an explicit observable assertion: ${missingRetainedAssertions.join(', ')}`);
}

if (checkMode) {
  if (!fs.existsSync(outputFile) || fs.readFileSync(outputFile, 'utf8') !== csv
    || !fs.existsSync(assertionOutputFile) || fs.readFileSync(assertionOutputFile, 'utf8') !== assertionCsv) {
    console.error('Functional-test classification is stale. Run: yarn test:generate:functional-classification');
    process.exit(1);
  }
} else {
  fs.writeFileSync(outputFile, csv);
  fs.writeFileSync(assertionOutputFile, assertionCsv);
}

const counts = rows.reduce((result, row) => {
  result[row.target] = (result[row.target] || 0) + 1;
  return result;
}, {});
const executionCounts = rows.reduce((result, row) => {
  result[row.executionDecision] = (result[row.executionDecision] || 0) + 1;
  return result;
}, {});
console.log(JSON.stringify({
  declared: declared.length,
  active: active.length,
  skipped: declared.length - active.length,
  classified: rows.length,
  materialDecisions: assertionRows.length,
  targets: counts,
  execution: executionCounts,
}, null, 2));

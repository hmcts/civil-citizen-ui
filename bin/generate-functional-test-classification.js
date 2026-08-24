#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outputFile = path.join(repoRoot, 'docs/functional-test-scenario-classification.csv');

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
  FULL_STACK: 'full-stack',
  REDUCED_STACK: 'reduced-stack-browser',
  IN_PROCESS: 'in-process-integration',
};

const proposedThinFullStackFiles = new Set([
  'bundles/cp_LiPvLiP_bundles_small_claims_tests.js',
  'case-struck-out/cp_LiPvLiP_case_struck_out_fast_track_tests.js',
  'create-claim/IndividualvsIndividual_tests.js',
  'defendant-linking/defendantLinkingThroughCUI_tests.js',
  'ga/LiPvLiP_GA_DismissAnOrder_tests.js',
  'hearings/cp_LiPvLiP_hearing_fee_tests_fast_track_tests.js',
  'noc/LipVLR_NoC_e2e_tests.js',
  'qm/qm_Hearing_LiPvLiP_followUp_tests.js',
]);

const domainRules = {
  bundles: ['Document generation and persistence must be observed through CCD and document services.', 'CCD, Camunda, document management', 'documents'],
  'case-offline': ['The assertion depends on a genuine CCD state transition and workflow completion.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  'case-progression': ['The order and dashboard state are produced by genuine CCD/Camunda processing.', 'Civil Service, CCD, Camunda', 'state-transitions'],
  'case-struck-out': ['The struck-out state and resulting notifications depend on real scheduled workflow processing.', 'Civil Service, CCD, Camunda', 'state-transitions'],
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

const reducedStackFiles = new Set([
  'part-admit/LRvLip_response_negativeScenarios_tests.js',
]);

const compoundCreateClaimFiles = new Set([
  'create-claim/CompanyVsIndividual_tests.js',
  'create-claim/CompanyVsOrg__tests.js',
  'create-claim/IndividualvsCompany_tests.js',
  'create-claim/OrgVsSoleTrader_tests.js',
  'create-claim/SoleTraderVsIndividual_tests.js',
]);

const inProcessFiles = new Set([
  'payments/payment_auth_guard_tests.js',
]);

function relativeTestPath(filePath) {
  return filePath.replace('src/test/functionalTests/tests/ui_tests/', '');
}

function classify(scenario) {
  const file = relativeTestPath(scenario.filePath);
  const domain = file.split('/')[0];

  if (inProcessFiles.has(file)) {
    return {
      target: TARGETS.IN_PROCESS,
      reason: 'Authentication and redirect guards are CUI controller/session behaviour; real payment or CCD services add no confidence.',
      services: 'CUI process only; downstream clients mocked',
      owner: 'civil-citizen-ui route/integration tests',
      batch: 'DTSCCI-6133 payment guards',
    };
  }

  if (reducedStackFiles.has(file)) {
    return {
      target: TARGETS.REDUCED_STACK,
      reason: 'The material value is browser navigation, validation, session and rendered content; downstream responses can be deterministic.',
      services: 'CUI, browser, Redis, WireMock',
      owner: 'civil-citizen-ui reduced-stack browser suite',
      batch: `DTSCCI-6133 ${domain}`,
      secondaryTargets: 'none',
    };
  }

  if (compoundCreateClaimFiles.has(file)) {
    return {
      target: TARGETS.FULL_STACK,
      reason: 'This is a compound journey. Party-type form/navigation assertions belong in reduced-stack browser coverage and the submission contract belongs in Pact; payment, workflow, assignment and GA assertions require real services until separately reviewed.',
      services: 'Civil Service, CCD, Camunda, payments, role assignment, General Applications',
      owner: 'DTSCCI-5974 full-stack state assertions; DTSCCI-6133 deterministic split',
      batch: 'DTSCCI-6133 create-claim split',
      secondaryTargets: 'reduced-stack-browser: party/form/navigation; Pact: submission contract',
    };
  }

  if (domain === 'create-claim') {
    return {
      target: TARGETS.FULL_STACK,
      reason: 'This retained representative journey includes real fee payment, asynchronous workflow completion, defendant assignment and General Application creation. Deterministic claim-form assertions must be split to reduced-stack coverage rather than duplicated here.',
      services: 'Civil Service, CCD, Camunda, payments, role assignment, General Applications',
      owner: 'DTSCCI-5974 retained full-stack suite',
      batch: 'DTSCCI-5974 claim lifecycle',
      secondaryTargets: 'reduced-stack-browser: form/navigation; Pact: submission contract',
    };
  }

  const rule = domainRules[domain];
  if (!rule) {
    throw new Error(`No classification rule for ${file}`);
  }

  return {
    target: TARGETS.FULL_STACK,
    reason: rule[0],
    services: rule[1],
    owner: 'DTSCCI-5974 retained full-stack candidate; final scenario selection subject to reviewed thinning',
    batch: rule[2],
    secondaryTargets: 'none',
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

  const rows = active.map(scenario => {
    const file = relativeTestPath(scenario.filePath);
    const ordinal = (ordinalByFile.get(file) || 0) + 1;
    ordinalByFile.set(file, ordinal);
    const classification = classify(scenario);
    const pipeline = scenario.tags
      .filter(tag => ['@civil-citizen-pr', '@civil-citizen-master', '@civil-citizen-nightly'].includes(tag))
      .map(tag => tag.replace('@civil-citizen-', ''))
      .join(';') || 'group/on-demand only';
    const materialSteps = [
      ...(scenario.beforeSuiteSteps || []),
      ...(scenario.beforeSteps || []),
      ...(scenario.collectedSteps || []),
    ];

    return {
      id: `${file}#${ordinal}`,
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
      executionDecision: classification.target === TARGETS.FULL_STACK
        ? (proposedThinFullStackFiles.has(file) && ordinal === 1 ? 'proposed-thin-full-stack' : 'nightly/on-demand-full-stack')
        : 'migrate-off-full-stack',
    };
  });

  rows.sort((left, right) => left.id.localeCompare(right.id));
  return { declared, active, rows };
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

const { declared, active, rows } = collectInventory();
const csv = renderCsv(rows);
const checkMode = process.argv.includes('--check');

if (checkMode) {
  if (!fs.existsSync(outputFile) || fs.readFileSync(outputFile, 'utf8') !== csv) {
    console.error('Functional-test classification is stale. Run: yarn test:generate:functional-classification');
    process.exit(1);
  }
} else {
  fs.writeFileSync(outputFile, csv);
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
  targets: counts,
  execution: executionCounts,
}, null, 2));

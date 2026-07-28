const fs = require('fs');
const path = require('path');

const SUMMARY_SCHEMA_VERSION = '1.0.0';
const FAILURE_SUMMARY_FILE = 'functional-failure-summary.json';

const CLASSIFICATIONS = {
  PREVIEW_DEPENDENCY_SETUP: 'preview/dependency setup',
  APPLICATION_DEFECT: 'application defect',
  TEST_QUALITY_AUTOMATION: 'test-quality/automation',
  TEST_DATA: 'test-data',
  CI_TOOLING: 'CI/tooling',
  UNKNOWN: 'unknown',
};

const SECRET_PATTERNS = [
  {
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
    replacement: 'Bearer [REDACTED]',
  },
  {
    pattern: /\b(?:access_token|id_token|refresh_token|authorization|cookie|set-cookie|client_secret|password|passwd|secret|token)\b\s*[:=]\s*["']?[^"',\s}]+/gi,
    replacement: (match) => `${match.split(/[:=]/)[0]}=[REDACTED]`,
  },
  {
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    replacement: '[REDACTED_JWT]',
  },
  {
    pattern: /\b[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[REDACTED_EMAIL]',
  },
  {
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: '[REDACTED_NUMBER]',
  },
];

function sanitizeString(value) {
  return SECRET_PATTERNS.reduce(
    (sanitized, { pattern, replacement }) => sanitized.replace(pattern, replacement),
    value,
  );
}

function sanitize(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitize(nestedValue)]),
    );
  }

  return value;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listMochawesomeReports(reportDir, reportPrefix) {
  if (!fs.existsSync(reportDir)) {
    return [];
  }

  return fs.readdirSync(reportDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .filter((fileName) => !reportPrefix || fileName.startsWith(`${reportPrefix}-`))
    .map((fileName) => path.join(reportDir, fileName))
    .sort();
}

function walkSuites(suite, callback, parentSuites = []) {
  const suiteTitle = suite?.title ? [...parentSuites, suite.title] : parentSuites;

  (suite?.tests || []).forEach((test) => callback(test, suiteTitle));
  (suite?.suites || []).forEach((childSuite) => walkSuites(childSuite, callback, suiteTitle));
}

function collectFailedTests(reportFile, report) {
  const failures = [];
  const reportStart = report?.stats?.start || null;
  const reportEnd = report?.stats?.end || null;

  (report?.results || []).forEach((result) => {
    walkSuites(result, (test, suiteTitles) => {
      if (test?.state !== 'failed' && test?.fail !== true) {
        return;
      }

      const errorSummary = test?.err?.message || test?.err?.estack || test?.err?.stack || null;

      failures.push({
        reportFile,
        suite: suiteTitles.join(' > ') || null,
        scenarioTest: test?.fullTitle || test?.title || null,
        durationMs: Number.isFinite(test?.duration) ? test.duration : null,
        startTime: test?.startedAt || reportStart,
        endTime: test?.endedAt || reportEnd,
        primaryErrorSummary: errorSummary,
        rawSignal: {
          state: test?.state || null,
          code: test?.err?.code || null,
          message: test?.err?.message || null,
          stack: test?.err?.estack || test?.err?.stack || null,
        },
      });
    });
  });

  return failures;
}

function classifyFailure(failure) {
  const rawSignal = [
    failure.primaryErrorSummary,
    failure.rawSignal?.message,
    failure.rawSignal?.stack,
  ].filter(Boolean).join('\n').toLowerCase();

  if (/executable doesn't exist|playwright.*install|browser binaries|dependency|npm ERR|yarn.*install/.test(rawSignal)) {
    return CLASSIFICATIONS.PREVIEW_DEPENDENCY_SETUP;
  }

  if (/expected status:\s*200, actual status:\s*500|internal server error|http 500|\b500\b/.test(rawSignal)) {
    return CLASSIFICATIONS.APPLICATION_DEFECT;
  }

  if (/timeout .*waiting|locator\..*timeout|element .*not.*found|strict mode violation|selector/.test(rawSignal)) {
    return CLASSIFICATIONS.TEST_QUALITY_AUTOMATION;
  }

  if (/test data|account created|user.*not found|case role|idam user|claim.*not found|fixture/.test(rawSignal)) {
    return CLASSIFICATIONS.TEST_DATA;
  }

  if (/err_network_changed|browser.*crash|target.*closed|sigterm|sigkill|killed|infrastructure|agent|no space left|econnreset|socket hang up/.test(rawSignal)) {
    return CLASSIFICATIONS.CI_TOOLING;
  }

  return CLASSIFICATIONS.UNKNOWN;
}

function findArtifactCandidates(reportDir) {
  if (!fs.existsSync(reportDir)) {
    return [];
  }

  const artifacts = [];
  const visit = (currentDir) => {
    fs.readdirSync(currentDir, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        visit(fullPath);
        return;
      }

      if (/\.(png|webm|zip|log|txt|json|html)$/i.test(entry.name)) {
        artifacts.push(fullPath);
      }
    });
  };

  visit(reportDir);
  return artifacts.sort();
}

function normalizeForMatch(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function artifactLinksForFailure(failure, artifactCandidates, workspace, buildUrl) {
  const scenarioSlug = normalizeForMatch(failure.scenarioTest);
  const matched = artifactCandidates.filter((artifactPath) => {
    const artifactSlug = normalizeForMatch(path.basename(artifactPath)
      .replace(/\.(failed\.)?(png|webm|zip)$/i, ''));
    const scenarioFragments = scenarioSlug.split('_').filter((fragment) => fragment.length > 2);
    const matchedFragments = scenarioFragments.filter((fragment) => artifactSlug.includes(fragment));

    return scenarioSlug && (
      artifactSlug.includes(scenarioSlug.slice(0, 80))
      || scenarioSlug.includes(artifactSlug.slice(0, 80))
      || matchedFragments.length >= Math.min(6, scenarioFragments.length)
    );
  });

  return matched.map((artifactPath) => {
    const relativePath = path.relative(workspace, artifactPath);
    return {
      label: path.basename(artifactPath),
      path: relativePath,
      url: buildUrl ? `${buildUrl.replace(/\/$/, '')}/artifact/${relativePath}` : null,
    };
  });
}

function buildSummary(options = {}) {
  const reportDir = options.reportDir || 'test-results/functional';
  const reportPrefix = options.reportPrefix || process.env.MOCHAWESOME_REPORTFILENAME || null;
  const workspace = options.workspace || process.cwd();
  const buildUrl = options.buildUrl || process.env.BUILD_URL || null;
  const attemptNumber = options.attemptNumber || process.env.ATTEMPT_NUMBER || process.env.RETRY_ATTEMPT || null;
  const artifactCandidates = findArtifactCandidates(reportDir);

  const failures = listMochawesomeReports(reportDir, reportPrefix)
    .flatMap((reportFile) => collectFailedTests(reportFile, readJson(reportFile)))
    .map((failure) => {
      const summaryFailure = {
        suite: failure.suite,
        scenarioTest: failure.scenarioTest,
        attemptNumber: attemptNumber ? Number(attemptNumber) : null,
        firstAttemptResult: !attemptNumber || Number(attemptNumber) === 1 ? 'failed' : null,
        startTime: failure.startTime,
        endTime: failure.endTime,
        durationMs: failure.durationMs,
        primaryStage: 'functional-test',
        primaryErrorSummary: failure.primaryErrorSummary,
        classification: classifyFailure(failure),
        retryOutcome: null,
        artifactLinks: artifactLinksForFailure(failure, artifactCandidates, workspace, buildUrl),
        rawSignal: failure.rawSignal,
      };

      return sanitize(summaryFailure);
    });

  return sanitize({
    schemaVersion: SUMMARY_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    jenkinsJobUrl: buildUrl,
    buildNumber: process.env.BUILD_NUMBER || null,
    commitSha: process.env.GIT_COMMIT || null,
    pr: process.env.CHANGE_ID || process.env.PR_NUMBER || null,
    suite: reportPrefix,
    failures,
  });
}

function writeSummary(options = {}) {
  const reportDir = options.reportDir || 'test-results/functional';
  const outputFile = options.outputFile || path.join(reportDir, FAILURE_SUMMARY_FILE);
  const summary = buildSummary(options);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(summary, null, 2)}\n`);

  return { summary, outputFile };
}

module.exports = {
  CLASSIFICATIONS,
  FAILURE_SUMMARY_FILE,
  SUMMARY_SCHEMA_VERSION,
  buildSummary,
  classifyFailure,
  sanitize,
  sanitizeString,
  writeSummary,
};

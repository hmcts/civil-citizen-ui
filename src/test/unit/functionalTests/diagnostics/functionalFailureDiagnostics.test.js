const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  CLASSIFICATIONS,
  buildSummary,
  classifyFailure,
  sanitize,
  sanitizeString,
  wiremockRequestsFromDiagnostic,
} = require('../../../functionalTests/diagnostics/functionalFailureDiagnostics');

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

describe('functional failure diagnostics', () => {
  describe('sanitizeString', () => {
    it('redacts bearer tokens, cookies, emails, passwords and long payment numbers', () => {
      const raw = [
        'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.signature',
        'Cookie: session=abc123',
        'password=Password123',
        'claimantcitizen-test@example.com',
        '4444333322221111',
      ].join('\n');

      const sanitized = sanitizeString(raw);

      expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiJ9.payload.signature');
      expect(sanitized).not.toContain('abc123');
      expect(sanitized).not.toContain('Password123');
      expect(sanitized).not.toContain('claimantcitizen-test@example.com');
      expect(sanitized).not.toContain('4444333322221111');
      expect(sanitized).toContain('[REDACTED_EMAIL]');
      expect(sanitized).toContain('[REDACTED_NUMBER]');
    });

    it('does not redact Codecept artifact filenames containing tags', () => {
      const fileName = 'Functional_diagnostics_browser_assertion_failure_@browser-diagnostics.failed.png';

      expect(sanitizeString(fileName)).toBe(fileName);
    });

    it('redacts sensitive object fields and nested personal data', () => {
      const sanitized = sanitize({
        headers: {
          Authorization: 'Basic service-credential',
          Cookie: 'session=private-session',
          Accept: 'application/json',
        },
        cookies: {session: 'private-cookie'},
        body: {email: 'citizen@example.com'},
      });

      expect(sanitized.headers.Authorization).toBe('[REDACTED]');
      expect(sanitized.headers.Cookie).toBe('[REDACTED]');
      expect(sanitized.headers.Accept).toBe('application/json');
      expect(sanitized.cookies).toBe('[REDACTED]');
      expect(sanitized.body.email).toBe('[REDACTED_EMAIL]');
      expect(JSON.stringify(sanitized)).not.toContain('service-credential');
      expect(JSON.stringify(sanitized)).not.toContain('private-session');
      expect(JSON.stringify(sanitized)).not.toContain('private-cookie');
      expect(JSON.stringify(sanitized)).not.toContain('citizen@example.com');
    });
  });

  describe('wiremockRequestsFromDiagnostic', () => {
    it.each([
      [{requests: [{method: 'GET', url: '/unmatched'}]}],
      [{status: 200, body: {requests: [{method: 'GET', url: '/unmatched'}]}}],
    ])('reads raw and collected WireMock diagnostics', (diagnostic) => {
      expect(wiremockRequestsFromDiagnostic(diagnostic)).toEqual([{method: 'GET', url: '/unmatched'}]);
    });
  });

  describe('classifyFailure', () => {
    it.each([
      ['browserType.launch: Executable doesn\'t exist at /ms-playwright/chromium', CLASSIFICATIONS.PREVIEW_DEPENDENCY_SETUP],
      ['Expected status: 200, actual status: 500, message: Internal Server Error', CLASSIFICATIONS.APPLICATION_DEFECT],
      ['locator.click Timeout 30000ms exceeded while waiting for button', CLASSIFICATIONS.TEST_QUALITY_AUTOMATION],
      ['IDAM user not found while preparing test data', CLASSIFICATIONS.TEST_DATA],
      ['page.goto: net::ERR_NETWORK_CHANGED', CLASSIFICATIONS.CI_TOOLING],
      ['Unexpected failure', CLASSIFICATIONS.UNKNOWN],
    ])('classifies %s', (message, classification) => {
      expect(classifyFailure({ primaryErrorSummary: message, rawSignal: { message } })).toBe(classification);
    });
  });

  describe('buildSummary', () => {
    let tempDir;
    const originalEnv = process.env;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'functional-diagnostics-'));
      process.env = {
        ...originalEnv,
        BUILD_URL: 'https://build.hmcts.net/job/example/1/',
        BUILD_NUMBER: '1',
        GIT_COMMIT: 'abc123',
        CHANGE_ID: '7982',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates required summary fields and sanitises raw failure signal', () => {
      const reportDir = path.join(tempDir, 'test-results/functional');
      writeJson(path.join(reportDir, 'civil-citizen-pr-123.json'), {
        stats: {
          start: '2026-07-27T16:11:17.000Z',
          end: '2026-07-27T16:11:20.000Z',
        },
        results: [{
          title: 'Functional diagnostics failure @civil-citizen-pr @browser-diagnostics',
          suites: [{
            title: 'Functional diagnostics failure @civil-citizen-pr @browser-diagnostics',
            tests: [{
              title: 'Browser assertion failure for diagnostic evidence',
              fullTitle: 'Functional diagnostics failure Browser assertion failure for diagnostic evidence @browser-diagnostics',
              state: 'failed',
              duration: 1563,
              err: {
                message: 'Error: Functional diagnostics failure for claimant@example.com with Bearer abc.def.ghi',
                estack: 'password=Password123\ncard 4444333322221111',
              },
            }],
          }],
        }],
      });
      fs.writeFileSync(
        path.join(reportDir, 'Functional_diagnostics_browser_assertion_failure.failed.png'),
        'png',
      );
      fs.writeFileSync(
        path.join(reportDir, 'Functional_diagnostics_browser_assertion_failure_@browser-diagnostics.failed.png'),
        'png',
      );

      const summary = buildSummary({
        reportDir,
        reportPrefix: 'civil-citizen-pr',
        workspace: tempDir,
      });

      expect(summary.schemaVersion).toBe('1.0.0');
      expect(summary.jenkinsJobUrl).toBe('https://build.hmcts.net/job/example/1/');
      expect(summary.buildNumber).toBe('1');
      expect(summary.commitSha).toBe('abc123');
      expect(summary.pr).toBe('7982');
      expect(summary.suite).toBe('civil-citizen-pr');
      expect(summary.failures).toHaveLength(1);

      const failure = summary.failures[0];
      expect(failure.scenarioTest).toContain('Browser assertion failure');
      expect(failure.attemptNumber).toBeNull();
      expect(failure.firstAttemptResult).toBe('failed');
      expect(failure.durationMs).toBe(1563);
      expect(failure.primaryStage).toBe('functional-test');
      expect(failure.classification).toBe(CLASSIFICATIONS.UNKNOWN);
      expect(failure.retryOutcome).toBeNull();
      expect(failure.artifactLinks.map(({ label }) => label)).toContain('Functional_diagnostics_browser_assertion_failure_@browser-diagnostics.failed.png');
      expect(failure.artifactLinks.map(({ url }) => url)).toContain('https://build.hmcts.net/job/example/1/artifact/test-results/functional/Functional_diagnostics_browser_assertion_failure_@browser-diagnostics.failed.png');

      const serialized = JSON.stringify(summary);
      expect(serialized).not.toContain('claimant@example.com');
      expect(serialized).not.toContain('abc.def.ghi');
      expect(serialized).not.toContain('Password123');
      expect(serialized).not.toContain('4444333322221111');
    });

    it('records a sanitised unmatched WireMock request when browser tests pass', () => {
      const reportDir = path.join(tempDir, 'test-results/functional');
      writeJson(path.join(reportDir, 'civil-citizen-pr-123.json'), {
        stats: {failures: 0},
        results: [],
      });
      writeJson(path.join(reportDir, 'wiremock/unmatched-requests.json'), {
        status: 200,
        body: {
          requests: [{
            method: 'GET',
            url: '/qa-unmatched-wiremock-request',
            headers: {Authorization: 'Bearer private-token'},
          }],
        },
      });
      writeJson(path.join(reportDir, 'wiremock/request-journal.json'), {
        status: 200,
        body: {requests: []},
      });

      const summary = buildSummary({
        reportDir,
        reportPrefix: 'civil-citizen-pr',
        workspace: tempDir,
      });

      expect(summary.failures).toHaveLength(1);
      expect(summary.failures[0]).toMatchObject({
        suite: 'reduced-stack-wiremock',
        scenarioTest: 'Unexpected WireMock request verification',
        primaryStage: 'wiremock-verification',
        primaryErrorSummary: 'WireMock received 1 unmatched request(s): GET /qa-unmatched-wiremock-request',
        rawSignal: {unmatchedRequests: [{method: 'GET', url: '/qa-unmatched-wiremock-request'}]},
      });
      expect(summary.failures[0].artifactLinks.map(({label}) => label)).toEqual(expect.arrayContaining([
        'request-journal.json',
        'unmatched-requests.json',
      ]));
      expect(JSON.stringify(summary)).not.toContain('private-token');
    });

    it('supports the nested request shape returned by older WireMock journals', () => {
      const reportDir = path.join(tempDir, 'test-results/functional');
      writeJson(path.join(reportDir, 'wiremock/unmatched-requests.json'), {
        requests: [{request: {method: 'POST', url: '/legacy-unmatched'}}],
      });

      const summary = buildSummary({reportDir, workspace: tempDir});

      expect(summary.failures[0].primaryErrorSummary)
        .toBe('WireMock received 1 unmatched request(s): POST /legacy-unmatched');
    });
  });
});

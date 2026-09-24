require('dotenv').config({path: '.env.tests.local'});

const { threadId } = require('worker_threads');
const { testFilesHelper } = require('./src/test/functionalTests/plugins/failedAndNotExecutedTestFilesPlugin.js');
const testConfig = require('./src/test/config.js');
const { unAssignAllUsers } = require('./src/test/functionalTests/specClaimHelpers/api/caseRoleAssignmentHelper');
const { deleteAllIdamTestUsers } = require('./src/test/functionalTests/specClaimHelpers/api/idamHelper');
const functional = process.env.FUNCTIONAL;

const getTests = () => {
  let prevFailedTestFiles = process.env.PREV_FAILED_TEST_FILES;
  let prevNotExecutedTestFiles = process.env.PREV_NOT_EXECUTED_TEST_FILES;

  if (prevFailedTestFiles !== undefined || prevNotExecutedTestFiles !== undefined) {
    prevFailedTestFiles = prevFailedTestFiles ? prevFailedTestFiles.split(',') : [];
    prevNotExecutedTestFiles = prevNotExecutedTestFiles ? prevNotExecutedTestFiles.split(',') : [];
    return [...prevFailedTestFiles, ...prevNotExecutedTestFiles];
  }

  return ['./src/test/functionalTests/tests/{*,**/*}.js'];
};

exports.config = {
  // Staggers each worker's start so `run-workers` doesn't open a burst of
  // simultaneous connections to the preview backend the moment the suite
  // starts (each worker is a real Node worker_threads.Worker, so threadId
  // reliably distinguishes them). Set WORKER_STAGGER_MS to enable; 0/unset
  // keeps this a no-op for local/non-worker runs.
  bootstrap: async () => {
    const staggerMs = parseInt(process.env.WORKER_STAGGER_MS || '0', 10);
    if (staggerMs > 0 && threadId > 0) {
      await new Promise((resolve) => setTimeout(resolve, (threadId - 1) * staggerMs));
    }
  },
  bootstrapAll: async () => {
    if (functional) {
      await testFilesHelper.createTempFailedTestsFile();
      await testFilesHelper.createTempPassedTestsFile();
      await testFilesHelper.createTempToBeExecutedTestsFile();
    }
  },
  teardownAll: async () => {
    if (functional) {
      await testFilesHelper.createTestFilesReport();
      await testFilesHelper.deleteTempFailedTestsFile();
      await testFilesHelper.deleteTempPassedTestsFile();
      await testFilesHelper.deleteTempToBeExecutedTestFiles();
    }
  },
  async teardown() {
    console.log('Current worker has finished running tests so we should clean up the user roles');
    await unAssignAllUsers();
    await deleteAllIdamTestUsers();
  },
  tests: getTests(),
  output: process.env.REPORT_DIR || 'test-results/functional',
  helpers: {
    ...(process.env.OPTIMISED_FUNCTIONAL_TESTS === 'true' ? {
      WiremockBoundary: {
        require: './src/test/functionalTests/helpers/wiremockBoundary.js',
        url: process.env.WIREMOCK_URL,
      },
    } : {}),
    Playwright: {
      url: testConfig.TestUrl,
      show: process.env.SHOW_BROWSER_WINDOW === 'true' || false,
      browser: 'chromium',
      waitForTimeout: parseInt(process.env.WAIT_FOR_TIMEOUT_MS || 90000),
      windowSize: '1280x960',
      timeout: 30000,
      waitForAction: 500,
      video: true,
      trace: true,
      contextOptions: {
        recordVideo: {
          dir: 'failed-videos',
        },
      },
      waitForNavigation: 'networkidle',
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    },
    BrowserHelpers: {
      require: './src/test/functionalTests/helpers/browser_helper.js',
    },
  },
  include: {
    api: './src/test/functionalTests/specClaimHelpers/api/steps.js',
    wa: './src/test/functionalTests/specClaimHelpers/api/stepsWA.js',
    noc: './src/test/functionalTests/specClaimHelpers/api/steps_noc.js',
    qm: './src/test/functionalTests/specClaimHelpers/api/steps_qm.js',
  },
  plugins: {
    autoDelay: {
      enabled: true,
      methods: [
        'click',
        'fillField',
        'checkOption',
        'selectOption',
        'attachFile',
        'see',
        'seeInCurrentUrl',
      ],
    },
    retryFailedStep: {
      enabled: process.env.DISABLE_TEST_RETRIES !== 'true',
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
    failedAndNotExecutedTestFilesPlugin: {
      enabled: functional ?? false,
      require: './src/test/functionalTests/plugins/failedAndNotExecutedTestFilesPlugin',
    },
    allure: {
      enabled: true,
      require: 'allure-codeceptjs',
      resultsDir: process.env.ALLURE_RESULTS_DIR || 'test-results/functional/allure-results',
    },
  },
  mocha: {
    bail: true,
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: {
          steps: false,
        },
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: {
          mochaFile: process.env.REPORT_FILE || 'test-results/functional/result.xml',
        },
      },
      'mochawesome': {
        stdout: '-',
        options: {
          reportDir: process.env.REPORT_DIR || 'test-results/functional',
          reportFilename: `${process.env.MOCHAWESOME_REPORTFILENAME + '-' + new Date().getTime()}`,
          inlineAssets: true,
          overwrite: false,
          json: true,
        },
      },
    },
  },
};

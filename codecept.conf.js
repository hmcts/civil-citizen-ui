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

  return ['./src/test/functionalTests/tests/{*,**/*}.js',
    './src/test/e2eTests/tests/{*,**/*}.js'];
};

exports.config = {
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
      enabled: true,
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
      resultsDir: 'test-results/functional/allure-results',
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
          json: false,
        },
      },
    },
  },
};

const testPath = './src/test';

const { testFilesHelper } = require(`${testPath}/functionalTests/plugins/failedAndNotExecutedTestFilesPlugin.js`);
const testConfig = require(`${testPath}/config.js`);
const {unAssignAllUsers} = require(`${testPath}/functionalTests/specClaimHelpers/api/caseRoleAssignmentHelper`);
const {deleteAllIdamTestUsers} = require(`${testPath}/functionalTests/specClaimHelpers/api/idamHelper`);

const getTests = () => {
  if (process.env.FAILED_TEST_FILES)
    return [...process.env.FAILED_TEST_FILES.split(','), ...process.env.NOT_EXECUTED_TEST_FILES.split(',')];

  if (process.env.ENVIRONMENT == 'aat')
    return [`${testPath}/functionalTests/tests/prod/**/*.js`,
      `${testPath}/functionalTests/tests/common/**/*.js`,
      `${testPath}/e2eTests/tests/**/*.js`];

  return [ `${testPath}/functionalTests/tests/nonprod/**/*.js`,
    `${testPath}/functionalTests/tests/common/**/*.js`,
    `${testPath}/e2eTests/tests/**/*.js`];
};

exports.config = {
  bootstrapAll: async () => {
    await testFilesHelper.createTempFailedTestsFile();
    await testFilesHelper.createPassedTestsFile();
    await testFilesHelper.createToBeExecutedTestsFile();
    await testFilesHelper.createNotExecutedTestsFile();
  },
  teardownAll: async () => {
    await testFilesHelper.createFailedTestsFile();
    await testFilesHelper.writeNotExecutedTestFiles();
    await testFilesHelper.deleteTempFailedTestsFile();
    await testFilesHelper.deleteToBeExecutedTestFiles();
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
      contextOptions : {
        recordVideo:{
          dir:'failed-videos',
        },
      },
      waitForNavigation: 'networkidle',
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    },
    BrowserHelpers: {
      require: `${testPath}/functionalTests/helpers/browser_helper.js`,
    },
  },
  include: {
    api: `${testPath}/functionalTests/specClaimHelpers/api/steps.js`,
    wa: `${testPath}/functionalTests/specClaimHelpers/api/stepsWA.js`,
    noc: `${testPath}/functionalTests/specClaimHelpers/api/steps_noc.js`,
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
      enabled: true,
      require: `${testPath}/functionalTests/plugins/failedAndNotExecutedTestFilesPlugin`,
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
          reportFilename: `${process.env.MOCHAWESOME_REPORTFILENAME+'-'+new Date().getTime()}`,
          inlineAssets: true,
          overwrite: false,
          json: false,
        },
      },
    },
  },
};

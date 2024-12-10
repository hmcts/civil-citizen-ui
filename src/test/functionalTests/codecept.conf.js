/* eslint-disable no-unused-vars */
const testConfig = require('../config.js');
const {unAssignAllUsers} = require('./specClaimHelpers/api/caseRoleAssignmentHelper');
const {deleteAllIdamTestUsers} = require('./specClaimHelpers/api/idamHelper');

//const testHeadlessBrowser = process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true;
process.env.PLAYWRIGHT_SERVICE_RUN_ID = process.env.PLAYWRIGHT_SERVICE_RUN_ID || new Date().toISOString();
let startTime;
exports.config = {
  bootstrapAll: async () => {
    startTime = new Date();
    console.log(`Starting the tests at ${startTime}`);
  },
  teardownAll: async () => {
    const endTime = new Date();
    const executionTime = (endTime - startTime) / 1000; // in seconds
    console.log(`Finished the tests at ${endTime}`);
    console.log(`Total execution time: ${executionTime} seconds`);
  },
  async teardown() {
    console.log('Current worker has finished running tests so we should clean up the user roles');
    await unAssignAllUsers();
    // await deleteAllIdamTestUsers();
  },
  tests: '../functionalTests/tests/**/*.js',
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
      retries: 3,
      chromium: process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN && {
        timeout: 30000,
        headers: {
          'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN,
        },
        exposeNetwork: testConfig.TestUrl ? '*.platform.hmcts.net' : '<loopback>',
        browserWSEndpoint: {
          wsEndpoint: `${process.env.PLAYWRIGHT_SERVICE_URL}?cap=${JSON.stringify({
            os: 'linux',
            runId: process.env.PLAYWRIGHT_SERVICE_RUN_ID,
          })}`,
        },
      },
    },
    BrowserHelpers: {
      require: './helpers/browser_helper.js',
    },
  },
  include: {
    api: './specClaimHelpers/api/steps.js',
    wa: './specClaimHelpers/api/stepsWA.js',
    noc: './specClaimHelpers/api/steps_noc.js',
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

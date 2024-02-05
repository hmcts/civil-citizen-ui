const testConfig = require('../config.js');

//const testHeadlessBrowser = process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true;
process.env.PLAYWRIGHT_SERVICE_RUN_ID = process.env.PLAYWRIGHT_SERVICE_RUN_ID || new Date().toISOString();

exports.config = {
  tests: '../functionalTests/tests/**/*_tests.js',
  output: process.env.REPORT_DIR || 'test-results/functional',
  helpers: {
    Playwright: {
      url: testConfig.TestUrl,
      show: false,
      browser: 'chromium',
      waitForTimeout: testConfig.WaitForTimeout,
      windowSize: '1920x1080',
      timeout: testConfig.WaitForTimeout,
      waitForAction: 500,
      waitForNavigation: 'networkidle0',
      ignoreHTTPSErrors: true,
      retries: 3,
      chromium: process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN && {
        timeout: testConfig.WaitForTimeout,
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
  },
  include: {
    api: './specClaimHelpers/api/steps.js',
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

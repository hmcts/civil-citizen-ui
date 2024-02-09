const testConfig = require('../config.js');
const {createAccount, deleteAccount} = require('./specClaimHelpers/api/idamHelper');

//const testHeadlessBrowser = process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true;

exports.config = {
  tests: '../functionalTests/tests/**/*_tests.js',
  output: process.env.REPORT_DIR || 'test-results/functional',

  async bootstrapAll() {
    await createAccount(testConfig.defendantCitizenUser.email, testConfig.defendantCitizenUser.password);
  },

  async teardownAll() {
    await deleteAccount(testConfig.defendantCitizenUser.email);
  },

  helpers: testConfig.helpers,
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

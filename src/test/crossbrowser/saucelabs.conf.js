const supportedBrowsers = require('../crossbrowser/supportedBrowsers.js');
const {unAssignAllUsers} = require('../functionalTests/specClaimHelpers/api/caseRoleAssignmentHelper');
const {deleteAllIdamTestUsers} = require('../functionalTests/specClaimHelpers/api/idamHelper');
const testConfig = require('../config');

const browser = process.env.SAUCELABS_BROWSER || 'chromium';
const tunnelName = process.env.TUNNEL_IDENTIFIER || 'reformtunnel';
const getBrowserConfig = (browserGroup) => {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const desiredCapability = supportedBrowsers[browserGroup][candidateBrowser];
      desiredCapability['sauce:options'].tunnelIdentifier = tunnelName;
      desiredCapability['sauce:options'].acceptSslCerts = true;
      desiredCapability['sauce:options'].tags = ['citizen-ui'];
      browserConfig.push({
        browser: desiredCapability.browserName,
        desiredCapabilities: desiredCapability,
      });
    } else {
      console.error('ERROR: supportedBrowsers.js is empty or incorrectly defined');
    }
  }
  return browserConfig;
};

let startTime;
const setupConfig = {
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
    await deleteAllIdamTestUsers();
  },
  tests: process.env.ENVIRONMENT == 'aat' ?
    [ '../functionalTests/tests/prod/**/*.js',
      '../functionalTests/tests/common/**/*.js',
      '../e2eTests/tests/**/*.js'] :
    [ '../functionalTests/tests/nonprod/**/*.js',
      '../functionalTests/tests/common/**/*.js',
      '../e2eTests/tests/**/*.js'],
  output: `${process.cwd()}/functional-output`,
  helpers: {
    Playwright: {
      url: testConfig.TestUrl,
      browser,
      cssSelectorsEnabled: 'true',

      user: process.env.SAUCE_USERNAME,
      key: process.env.SAUCE_ACCESS_KEY,
      region: 'eu',
      sauceConnect: true,
      services: ['sauce'],

      // This line is required to ensure test name and browsers are set correctly for some reason.
      desiredCapabilities: {'sauce:options': {}},
    },
    SauceLabsReportingHelper: {
      require: './helpers/SauceLabsReportingHelper.js',
    },
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
  include: {
    api: '../functionalTests/specClaimHelpers/api/steps.js',
    wa: '../functionalTests/specClaimHelpers/api/stepsWA.js',
    noc: '../functionalTests/specClaimHelpers/api/steps_noc.js',
  },
  mocha: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: process.env.CROSSBROWSER_OUTPUT_DIR || './functional-output',
      reportTitle: 'Crossbrowser results',
      inline: true,
    },
  },
  multiple: {
    microsoftIE11: {
      browsers: getBrowserConfig('microsoftIE11'),
    },
    microsoftEdge: {
      browsers: getBrowserConfig('microsoftEdge'),
    },
    chrome: {
      browsers: getBrowserConfig('chrome'),
    },
    firefox: {
      browsers: getBrowserConfig('firefox'),
    },
    safari: {
      browsers: getBrowserConfig('safari'),
    },
  },
};

exports.config = setupConfig;

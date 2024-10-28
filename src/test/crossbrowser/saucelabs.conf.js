const supportedBrowsers = require('../crossbrowser/supportedBrowsers.js');
const {unAssignAllUsers} = require('../functionalTests/specClaimHelpers/api/caseRoleAssignmentHelper');
const {deleteAllIdamTestUsers} = require('../functionalTests/specClaimHelpers/api/idamHelper');
const testConfig = require('../config');

const browser = process.env.SAUCELABS_BROWSER || 'chrome';

const defaultSauceOptions = {
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || 'reformtunnel',
  acceptSslCerts: true,
  pageLoadStrategy: 'normal',
  idleTimeout: 700,
  tags: ['Citizen UI'],
};

function merge(intoObject, fromObject) {
  return Object.assign({}, intoObject, fromObject);
}

function getBrowserConfig(browserGroup) {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const candidateCapabilities = supportedBrowsers[browserGroup][candidateBrowser];
      candidateCapabilities['sauce:options'] = merge(
        defaultSauceOptions, candidateCapabilities['sauce:options'],
      );
      browserConfig.push({
        browser: candidateCapabilities.browserName,
        capabilities: candidateCapabilities,
      });
    } else {
      console.error('ERROR: supportedBrowsers.js is empty or incorrectly defined');
    }
  }
  return browserConfig;
}

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
    WebDriver: {
      url: process.env.TEST_URL || 'https://moneyclaims.demo.platform.hmcts.net',
      browser,
      keepCookies: true,
      waitForTimeout: 90000,
      smartWait: 90000,
      cssSelectorsEnabled: 'true',
      chromeOptions: {
        args: [
          'start-maximized',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-sandbox',
          'disable-infobars',
          'ignore-gpu-blacklist',
        ],
      },
      acceptInsecureCerts: true,
      sauceSeleniumAddress: 'ondemand.eu-central-1.saucelabs.com:443/wd/hub',
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      sauceConnect: true,
      supportedBrowsers,
      capabilities: {},
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

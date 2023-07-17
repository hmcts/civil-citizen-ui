const testConfig = require('../config');
const supportedBrowsers = require('./supportedBrowsers');
const testUrl = process.env.TEST_URL || 'http://localhost:3001';

const waitForTimeout = parseInt(testConfig.saucelabs.waitForTimeout);
const smartWait = parseInt(testConfig.saucelabs.smartWait);
const browser = process.env.SAUCE_BROWSER || 'chromium';

const defaultSauceOptions = {
  username: process.env.SAUCE_USERNAME || testConfig.saucelabs.username,
  accessKey: process.env.SAUCE_ACCESS_KEY || testConfig.saucelabs.key,
  tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || testConfig.saucelabs.tunnelId,
  acceptSslCerts: true,
  tags: ['Civil CUI'],
};

function merge(intoObject, fromObject) {
  return Object.assign({}, intoObject, fromObject);
}

function getBrowserConfig(browserGroup) {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const candidateCapabilities = supportedBrowsers[browserGroup][candidateBrowser];
      candidateCapabilities['sauce:options'] = merge(defaultSauceOptions, candidateCapabilities['sauce:options']);
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

const setupConfig = {
  tests: '../functionalTests/tests/*_tests.js',
  output: './test-results/saucelabs',
  helpers: {
    Playwright: {
      url: testUrl,
      browser,
      smartWait,
      waitForTimeout,
      cssSelectorsEnabled: 'true',
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      capabilities: {},
    },
    MyHelper: {
      require: './saucelabsHelper.js',
      url: testUrl,
    },
    Mochawesome: {
      uniqueScreenshotNames: 'true',
    },
  },
  include: {
    api: './specClaimHelpers/api/steps.js',
  },
  bootstrap: null,

  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: {
          steps: true,
        },
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: {
          mochaFile: `${testConfig.TestOutputDir}/result.xml`,
        },
      },
      'mochawesome': {
        stdout: testConfig.TestOutputDir + '/console.log',
        options: {
          reportDir: testConfig.TestOutputDir,
          reportName: 'et ccd callback x-browsers test',
          reportTitle: 'Crossbrowser results for: ' + browser.toUpperCase(),
          inlineAssets: true,
        },
      },
    },
  },
  multiple: {
    /* microsoftIE11: {
      browsers: getBrowserConfig('microsoftIE11'),
    },
    microsoftEdge: {
      browsers: getBrowserConfig('microsoftEdge'),
    },
    chrome: {
      browsers: 'chromium',
    },*/
    firefox: {
      browsers: getBrowserConfig('firefox'),
    },
    /* safari: {
      browsers: getBrowserConfig('safari'),
    },*/
  },
  name: 'Civil CaseProgression Crossbrowser Tests',
};

exports.config = setupConfig;

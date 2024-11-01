/* eslint-disable no-console */

const supportedBrowsers = require('../crossbrowser/supportedBrowsers.js');
const testConfig = require('../config.js');

const browser = process.env.SAUCELABS_BROWSER || 'chrome';
const defaultSauceOptions = {
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || 'reformtunnel',
  acceptSslCerts: true,
  pageLoadStrategy: 'normal',
  idleTimeout: 700,
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
      candidateCapabilities['sauce:options'] = merge(
        defaultSauceOptions, candidateCapabilities['sauce:options']
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

const setupConfig = {
  tests: '../functionalTests/tests/common/**/*.js',
  output: `${process.cwd()}/${testConfig.TestOutputDir}`,
  helpers: {
    WebDriver: {
      url: testConfig.TestUrl,
      browser,
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
    BrowserHelpers: {
      require: './helpers/browser_helper.js',
    },
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
      retries: 2,
    },
    autoDelay: {
      enabled: true,
      methods: [
        'click',
        'fillField',
        'checkOption',
        'selectOption',
        'attachFile',
      ],
      delayAfter: 5000,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: 'true',
    },
  },
  include: {
    I: './specClaimHelpers/api/steps.js',
    api: './specClaimHelpers/api/steps.js',
    wa: './specClaimHelpers/api/stepsWA.js',
    noc: './specClaimHelpers/api/steps_noc.js',
  },
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
        options: {mochaFile: `${testConfig.TestOutputDir}/result.xml`},
      },
      mochawesome: {
        stdout: testConfig.TestOutputDir + '/console.log',
        options: {
          reportDir: testConfig.TestOutputDir,
          reportName: 'index',
          reportTitle: 'Crossbrowser results for: ' + browser.toUpperCase(),
          inlineAssets: true,
        },
      },
    },
  },
  multiple: {
    edge: {
      browsers: getBrowserConfig('edge'),
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
  name: 'Civil CUI Cross-Browser Tests',
};

exports.config = setupConfig;

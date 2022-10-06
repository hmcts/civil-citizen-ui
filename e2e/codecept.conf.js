exports.config = {

  tests: './tests/**/*_test.js',
  output: process.env.REPORT_DIR || 'test-results/functional',
  helpers: {
    Puppeteer: {
      restart: false,
      keepCookies: true,
      show: process.env.SHOW_BROWSER_WINDOW === 'true' || false,
      windowSize: '1200x900',
      waitForTimeout: parseInt(process.env.WAIT_FOR_TIMEOUT_MS || 50000),
      chrome: {
        ignoreHTTPSErrors: true,
      },
    },
    BrowserHelpers: {
      require: './helpers/browser_helper.js',
    },
    GenerateReportHelper: {
      require: './helpers/generate_report_helper.js',
    },
  },
  include: {
    I: './steps_file.js',
    api: './api/steps.js',
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
          inlineAssets: true,
          json: false,
        },
      },
    },
  },
};
  
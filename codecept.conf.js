exports.config = {
  tests: [    
    '/Users/nishanth/Code/MOJ/civil-citizen-ui/src/test/e2e/tests/api_tests/lrspec/api_1v1_spec_test.js',
  ],
  output: 'test-results/functional',
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
      require: '/Users/nishanth/Code/MOJ/civil-citizen-ui/src/test/e2e/helpers/browser_helper.js',
    },
    GenerateReportHelper: {
      require: '/Users/nishanth/Code/MOJ/civil-citizen-ui/src/test/e2e/helpers/generate_report_helper.js',
    },
  },
  include: {
    I: './e2e/steps_file.js',
    LRspec: './e2e/steps_file_LRspec.js',
    api: './e2e/api/steps.js',
    api_spec: './e2e/api/steps_LRspec.js',
    api_spec_fast: './e2e/api/steps_LRspecFast.js',
    api_spec_small: './e2e/api/steps_LRspecSmall.js',
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

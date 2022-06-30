import { setHeadlessWhen } from '@codeceptjs/configure';

import { config as testConfig } from '../config';

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.Config = {

  tests: [
    '../functionalTests/tests/*_tests.ts',
  ],

  name: 'civil-citizen-ui-functional',
  output: 'test-results/functional',
  helpers: testConfig.helpers,
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
          'verbose': true,
          'steps': true,
        },
      },
      'mocha-junit-reporter': {
        stdout: 'test-results/functional/console.log',
        options: {
          mochaFile: 'test-results/functional/result.xml',
          'attachments': true,
        },
      },
      'mochawesome': {
        stdout: 'test-results/functional/console.log',
        options: {
          reportDir: 'test-results/functional',
          inlineAssets: true,
          json: false,
          reportFilename: 'report',
        },
      },
    },
  },
};

import { setHeadlessWhen } from '@codeceptjs/configure';

import { config as testConfig } from '../config';

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.Config = {

  tests: [
    '../functionalTests/tests/*_tests.ts',
  ],

  name: 'civil-citizen-ui-functional',
  output: '.././output',
  helpers: testConfig.helpers,
  plugins: {
    allure: {
      enabled: true,
    },
    pauseOnFail: {
      enabled: !testConfig.TestHeadlessBrowser,
    },
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
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
        stdout: './src/test/output/console.log',
        options: {
          mochaFile: './src/test/output/result.xml',
          'attachments': true,
        },
      },
      'mochawesome': {
        stdout: './src/test/output/console.log',
        options: {
          reportDir: './src/test/output',
          inlineAssets: true,
          json: false,
          reportFilename: 'report',
        },
      },
    },
  },
};

import { setHeadlessWhen } from '@codeceptjs/configure';

import { config as testConfig } from '../config';

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.Config = {
  name: 'civil-citizen-ui-functional',
  gherkin: testConfig.Gherkin,
  output: '../../../functional-output/functional/reports',
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
};
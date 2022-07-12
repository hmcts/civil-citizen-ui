import { PropertiesVolume } from '../main/modules/properties-volume';
import { Application } from 'express';
const defaultPassword = 'Password12';

if (!process.env.TEST_PASSWORD) {
  new PropertiesVolume().enableFor({ locals: { developmentMode: true } } as unknown as Application);
}

export const config = {
  TestUrl: process.env.TEST_URL || 'https://civil-citizen-ui.demo.platform.hmcts.net',
  env: process.env.ENVIRONMENT_NAME || 'local',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 250,
  WaitForTimeout: 20000,
  helpers: {},
  username: 'cmcclaimant23@gmail.com',
  password: defaultPassword,
  PRusername: 'testprcui@gmail.com',
  PRpassword: 'Neelan@1234',
  hmctsUsername: 'raja.mani@hmcts.net',
  hmctsPassword: '',
};

config.helpers = {
  Playwright: {
    url: config.TestUrl,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    waitForTimeout: config.WaitForTimeout,
    waitForAction: 1000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  },
};

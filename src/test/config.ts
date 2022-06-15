import { PropertiesVolume } from '../main/modules/properties-volume';
import { Application } from 'express';
const defaultPassword = 'Password12';

if (!process.env.TEST_PASSWORD) {
  new PropertiesVolume().enableFor({ locals: { developmentMode: true } } as unknown as Application);
}

export const config = {
  TestUrl: process.env.TEST_URL || 'https://civil-citizen-ui.demo.platform.hmcts.net',
  env: 'demo',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : false,
  TestSlowMo: 250,
  WaitForTimeout: 10000,
  helpers: {},
  username: 'cmcclaimant23@gmail.com',
  password: defaultPassword,
  hmctsUsername: 'raja.mani@hmcts.net',
  hmctsPassword: 'MOJJan@London2022',
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

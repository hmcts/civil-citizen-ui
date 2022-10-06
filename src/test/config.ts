import { PropertiesVolume } from '../main/modules/properties-volume';
import { Application } from 'express';

if (!process.env.TEST_PASSWORD) {
  new PropertiesVolume().enableFor({ locals: { developmentMode: true } } as unknown as Application);
}

const username = process.env.CITIZEN_USERNAME;
const password = process.env.CITIZEN_PASSWORD;

export const config = {
  TestUrl: process.env.TEST_URL || 'https://civil-citizen-ui.demo.platform.hmcts.net',
  env: process.env.ENVIRONMENT_NAME || 'local',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 250,
  WaitForTimeout: 20000,
  helpers: {},
  Username:username,
  Password:password,
};

config.helpers = {
  Playwright: {
    url: config.TestUrl,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    waitForTimeout: config.WaitForTimeout,
    timeout: 20000,
    waitForAction: 1000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  },
};

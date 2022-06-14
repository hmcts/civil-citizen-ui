import { PropertiesVolume } from '../main/modules/properties-volume';
import { Application } from 'express';

if (!process.env.TEST_PASSWORD) {
  new PropertiesVolume().enableFor({ locals: { developmentMode: true } } as unknown as Application);
}

export const config = {
  TestUrl: process.env.TEST_URL || 'http://localhost:3001',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 250,
  WaitForTimeout: 10000,
  helpers: {},
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

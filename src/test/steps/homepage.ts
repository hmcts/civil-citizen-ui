
import {  config as testConfig } from '../config';
const { I } = inject();

Given('I create a new user and login', async () => {
  await I.amOnPage(testConfig.TEST_URL);
});

Then('I expect the page title to be {string}', (title: string) => {
  I.seeInTitle(title);
});
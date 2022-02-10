
import {  config as testConfig } from '../../config';

module.exports = {
  phonenumber(I): void {
    Given('Load Citizen phone number', async () => {
      await I.amOnPage(testConfig.TestUrl + '/citizen-phone');
    });

    Then('I expect the page to have content {string}', (content: string) => {
      I.see(content);
    });
  },
};

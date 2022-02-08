
import {  config as testConfig } from '../../config';

module.exports = {
  homepage(I): void {
    Given('Load Citizen UI homepage', async () => {
      await I.amOnPage('http://localhost:3001/home');
    });

    Then('I expect the page to have content {string}', (content: string) => {
      I.see(content);
    });
  },
};

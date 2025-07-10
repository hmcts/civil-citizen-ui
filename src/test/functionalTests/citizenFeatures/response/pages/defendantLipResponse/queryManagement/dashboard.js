const I = actor();
const config = require('../../../../../../config');

class DashboardPage {
  async sendAMessage () {
    await I.waitForContent('Contact us for help', config.WaitForText);
    await I.click(locate('#main-content #contact-us-for-help span').at(1));
    await I.waitForContent('Court staff can help with your application. They cannot give you legal advice.', config.WaitForText);
    await I.see('Send a message');
    await I.click('Send a message to the court');
  }

  async clickOnViewMessages () {
    await I.waitForContent('View messages', config.WaitForText);
    await I.click('//a[normalize-space()="View messages"]');
    await I.waitForContent('Messages', config.WaitForText);
  }

  async verifyUserQuery() {
    try {
      await I.waitForContent('Messages to the court', config.WaitForText);
      await I.click('View all messages to the court');
      await I.waitForContent('Messages', config.WaitForText);

      await I.see('Claimant Query');
      await I.see('Defendant Query');

      console.log('Checking Claimant Query...');
      await I.click('Claimant Query');
      await I.waitForContent('Claimant Query', config.WaitForText);
      await I.see('This query was raised by Claimant.');
      await I.see('Caseworker response to query.');
      await I.see('follow up to caseworker response.');
      await I.click('Back');
      await I.waitForContent('Messages', config.WaitForText);

      console.log('Checking Defendant Query...');
      await I.click('Defendant Query');
      await I.waitForContent('Defendant Query', config.WaitForText);
      await I.see('This query was raised by Defendant.');
      await I.see('Caseworker response to query.');
      await I.see('follow up to caseworker response.');
    } catch (error) {
      console.error('Error verifying user queries:', error);
      throw error;
    }
  }
}

module.exports = DashboardPage;

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
}

module.exports = DashboardPage;

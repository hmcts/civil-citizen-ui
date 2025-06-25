const I = actor();
const config = require('../../../../../../config');

class ViewQuery {

  async verifyMessagesBeforeFollowUp(subject, message, isHearingRelated = false) {
    await I.waitForContent('Messages', config.WaitForText);
    await I.see('Message sent');
    await I.see(subject);
    await I.click(subject);
    await I.waitForContent(subject, config.WaitForText);
    await I.see(message);
    if (isHearingRelated) {
      await I.see('What is the date of the hearing?');
    }
  }

  async verifyFollowUp(subject, message, isHearingRelated = false) {
    await I.waitForContent('Messages', config.WaitForText);
    await I.see('Response received');
    await I.see(subject);
    await I.click(subject);
    await I.waitForContent(subject, config.WaitForText);
    await I.see(message);
    if (isHearingRelated) {
      await I.see('What is the date of the hearing?');
    }
    await I.see('Response details');
  }

  async sendFollowUpMessage() {
    await I.click('Send a follow up message');
    await I.waitForContent('Send a follow up message', config.WaitForText);
    await I.fillField('#messageDetails', 'Follow up message');
    await I.click('Continue');
    await I.waitForContent('Check your answers', config.WaitForText);
    await I.click('Send message');
    await I.waitForContent('Your message has been sent to the court', config.WaitForText);
    await I.click('Go to your dashboard');
  }

  async verifyMessagesAfterFollowUp(subject) {
    await I.waitForContent('Messages', config.WaitForText);
    await I.see('Message sent');
    await I.see(subject);
    await I.click(subject);
    await I.waitForContent(subject, config.WaitForText);
    await I.see('Follow up message');
  }
}

module.exports = ViewQuery;

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
}

module.exports = ViewQuery;

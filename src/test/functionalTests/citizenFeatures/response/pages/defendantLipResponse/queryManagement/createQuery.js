const I = actor();
const config = require('../../../../../../config');

class CreateQuery {
  async fillSendMessageForm(subject, message, isHearingRelated = false) {
    await I.waitForContent('Enter message details', config.WaitForText);

    await I.fillField('#messageSubject', subject);
    await I.fillField('#messageDetails', message);

    if (isHearingRelated) {
      await I.checkOption('Yes');
      await I.fillField('#day', '08');
      await I.fillField('#month', '09');
      await I.fillField('#year', '2026');
    } else {
      await I.checkOption('No');
    }

    // Optional: Upload a file
    // await I.attachFile('input[name="query-file-upload"]', 'data/test-file.pdf');

    await I.click('Continue');
    await I.forceClick('Send message');
  }
}

module.exports = CreateQuery;

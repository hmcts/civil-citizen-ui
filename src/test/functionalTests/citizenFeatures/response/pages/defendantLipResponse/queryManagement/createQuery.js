const I = actor();
const config = require('../../../../../../config');
const moment = require('moment');

class CreateQuery {
  async fillSendMessageForm(subject, message, isHearingRelated = false) {
    await I.waitForContent('Enter message details', config.WaitForText);

    await I.fillField('#messageSubject', subject);
    await I.fillField('#messageDetails', message);

    if (isHearingRelated) {
      const hearingDate = moment().add(7, 'days');
      await I.checkOption('Yes');
      await I.fillField('#day', hearingDate.format('DD'));
      await I.fillField('#month', hearingDate.format('MM'));
      await I.fillField('#year', hearingDate.format('YYYY'));
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

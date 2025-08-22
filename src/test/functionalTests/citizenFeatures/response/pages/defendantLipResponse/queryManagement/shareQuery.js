const I = actor();
const config = require('../../../../../../config');

class ShareQuery {
  async fillShareQueryConfirmedForm() {
    await I.waitForContent('Sharing this message with the other party', config.WaitForText);

    await I.checkOption('input[name="confirmed"]');

    await I.click('Continue');
    await I.forceClick('Continue');
  }
}

module.exports = ShareQuery;

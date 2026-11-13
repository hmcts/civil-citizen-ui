const I = actor();
const config = require('../../../../../../config');

class ShareQuery {
  async fillShareQueryConfirmedForm() {
    await I.waitForContent('Sharing this message with the other party', config.WaitForText);

    await I.checkOption('input[name="confirmed"]');

    // One click submits the page. A second click (forceClick) failed in WebKit, where the page had already moved on.
    await I.click('Continue');
    await I.waitForFunction(() => !window.location.pathname.endsWith('/share-query'), config.WaitForText);
  }
}

module.exports = ShareQuery;

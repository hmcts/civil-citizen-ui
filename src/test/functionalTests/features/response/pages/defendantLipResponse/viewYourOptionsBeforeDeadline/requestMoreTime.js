const I = actor();
const config = require('../../../../../../config');

const fields = {
  moreThan28Days: '#option-2',
};

const buttons = {
  continue: 'button.govuk-button',
};

class RequestMoreTime {

  async open(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/response/request-more-time');
  }

  async verifyResponsePageContent() {
    await I.waitForText('Request more time to respond', config.WaitForText);
  }

  async requestMoreTimeToRespond(claimRef) {
    this.open(claimRef);
    await I.click(fields.moreThan28Days);
    await I.click(buttons.continue);
  }

}

module.exports = RequestMoreTime;

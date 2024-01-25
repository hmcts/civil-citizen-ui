const I = actor();
const config = require('../../../../../../config');

const buttons = {
  continue: '#main-content button.govuk-button',
};

class YouHavePaidLess {
  async verifyPaidLessPage() {
    await I.waitForText('You\'ve paid less than the total claim amount', config.WaitForText);
    await I.click(buttons.continue);
  }
}

module.exports = YouHavePaidLess;

const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  claimNumber: 'input[id="rows[0][claimNumber]"]',
  amountYouOwe: 'input[id="rows[0][amount]"]',
  installment: 'input[id="rows[0][instalmentAmount]"]',
};
const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

const content = {
  heading: {
    en: 'Are you paying money as a result of any court orders?',
    cy: 'A ydych yn talu arian o ganlyniad i unrhyw orchmynion llys?',
  },
};

class CourtOrders {

  async clickYesButton(claimref) {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.claimNumber, claimref);
    await I.fillField(fields.amountYouOwe, '1000');
    await I.fillField(fields.installment, '120');
    await I.click(buttons.saveAndContinue[language]);
  }
  async clickNoButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = CourtOrders;

const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  claimNumber: 'input[id="rows[0][claimNumber]"]',
  amountYouOwe: 'input[id="rows[0][amount]"]',
  installment: 'input[id="rows[0][instalmentAmount]"]',
};

const content = {
  heading: {
    en: 'Are you paying money as a result of any court orders?',
    cy: 'A ydych yn talu arian o ganlyniad i unrhyw orchmynion llys?',
  },
};

class CourtOrders {

  async clickYesButton(claimref) {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.claimNumber, claimref);
    await I.fillField(fields.amountYouOwe, '1000');
    await I.fillField(fields.installment, '120');
    await I.click(cButtons.saveAndContinue[language]);
  }
  async clickNoButton() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = CourtOrders;

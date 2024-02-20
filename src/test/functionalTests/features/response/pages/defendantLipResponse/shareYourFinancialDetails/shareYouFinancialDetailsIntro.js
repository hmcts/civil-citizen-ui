const I = actor();
const config = require('../../../../../../config');

const buttons = {
  continue: 'button.govuk-button',
};

class ShareYouFinancialDetailsIntro {

  async open(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/response/statement-of-means/intro');
    await I.waitForText('We\'ll ask you for the details then we\'ll send them to', config.WaitForText);
    await I.see('If they reject your proposal, the court will make a new plan using your financial details.');
    await I.see('They can reject your proposal if they believe you can pay sooner.');
  }

  async clickContinue() {
    await I.click(buttons.continue);
  }
}

module.exports = ShareYouFinancialDetailsIntro;

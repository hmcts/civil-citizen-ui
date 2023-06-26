const I = actor();

const buttons = {
  continue: 'button.govuk-button',
};

class ShareYouFinancialDetailsIntro {

  async open(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/response/statement-of-means/intro');
  }

  async clickContinue() {
    await I.click(buttons.continue);
  }
}

module.exports = ShareYouFinancialDetailsIntro;
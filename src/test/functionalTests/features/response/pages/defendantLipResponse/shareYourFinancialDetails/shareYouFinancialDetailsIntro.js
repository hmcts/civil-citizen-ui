const I = actor();

const buttons = {
  continue: 'button.govuk-button',
};

class ShareYouFinancialDetailsIntro {

  open(claimRef) {
    I.amOnPage('/case/' + claimRef + '/response/statement-of-means/intro');
  }

  clickContinue() {
    I.click(buttons.continue);
  }
}

module.exports = ShareYouFinancialDetailsIntro;
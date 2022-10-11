const I = actor();

const buttons = {
  continue: 'button.govuk-button',
};

export class ShareYouFinancialDetailsIntro {

  open(claimRef) {
    I.amOnPage('/case/' + claimRef + '/response/statement-of-means/intro');
  }

  clickContinue() {
    I.click(buttons.continue);
  }
}

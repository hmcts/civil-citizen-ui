import I = CodeceptJS.I

const I: I = actor();

const buttons = {
  continue: 'button.govuk-button',
};

export class ShareYouFinancialDetailsIntro {

  open(claimRef): void {
    I.amOnPage('/case/' + claimRef + '/response/statement-of-means/intro');
  }

  clickContinue(): void {
    I.click(buttons.continue);
  }
}

import I = CodeceptJS.I

const I: I = actor();

const fields = {
  cyaVerifyHeading: 'h1.govuk-heading-l',
  cyaVerifyResponse: 'dd.govuk-summary-list__value',
  cyaSigned: 'input[id="signed"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

export class CheckYourAnswersPage {
  checkAndSubmit(claimRef): void{
    I.amOnPage('/case/'+claimRef+'/response/check-and-send');
    I.see('Check your answers', fields.cyaVerifyHeading);
    I.click(fields.cyaSigned);
    I.click(buttons.saveAndContinue);
    // I.waitForText('You’ve submitted your response');
  }
}

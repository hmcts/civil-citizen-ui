import I = CodeceptJS.I

const I: I = actor();

const fields = {
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

export class WhyDoYouDisagreeTheClaimAmount {
  enterReason (claimRef): void {
    I.amOnPage('/case/'+claimRef+'/response/partial-admission/why-do-you-disagree')
    I.see('Why do you disagree with the claim amount?', 'h1');
    I.see('The total amount claimed is £');
    I.see('This includes the claim fee and any interest.');
    I.fillField(fields.text, 'Test reason');
    I.click(buttons.saveAndContinue);
  }
}

const I = actor();

const fields = {
  cyaSigned: 'input[id="signed"]',
};

const buttons = {
  submit: 'Submit Response',
};

export class CheckYourAnswersPage {
  checkAndSubmit(claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/check-and-send');
    I.see('Check your answers', 'h1');
    I.waitForElement(fields.cyaSigned);
    I.checkOption(fields.cyaSigned);
    I.click(buttons.submit);
    I.waitForText('You’ve submitted your response');
  }
}

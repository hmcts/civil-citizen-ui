const I = actor();

const fields = {
  cyaSigned: 'input[id="signed"]',
};

const buttons = {
  submit: 'Submit Response',
};

class CheckYourAnswersPage {
  checkAndSubmit(claimRef) {
    console.log('The value of the claimref inside check ur answers  ' + claimRef);
    I.amOnPage('/case/'+claimRef+'/response/check-and-send');
    I.see('Check your answers', 'h1');
    I.waitForElement(fields.cyaSigned);
    I.checkOption(fields.cyaSigned);
    I.click(buttons.submit);
    I.waitForText('You’ve submitted your response');
  }
}

module.exports = CheckYourAnswersPage;

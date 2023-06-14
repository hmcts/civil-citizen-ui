const I = actor();

const fields = {
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: 'Save and continue',
};

class WhyDoYouDisagree {
  enterReason (claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/your-defence');
    I.see('Why do you disagree with the claim?', 'h1');
    I.see('Briefly explain why you disagree with the claim');
    I.see('If you fail to dispute any part of the claim the court may assume you admit it.');
    I.see('You should also say if you accept any parts of the claim.');
    I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    I.see('Your response will be sent to ');
    I.fillField(fields.text, 'Test reason');
    I.click(buttons.saveAndContinue);
  }
}

module.exports = WhyDoYouDisagree;

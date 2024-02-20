const I = actor();
const config = require('../../../../../../config');

const fields = {
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class WhyDoYouDisagree {
  async enterReason (claimRef) {
    await I.amOnPage('/case/'+claimRef+'/response/your-defence');
    await I.waitForText('Why do you disagree with the claim?', config.WaitForText);
    await I.see('Briefly explain why you disagree with the claim');
    await I.see('If you fail to dispute any part of the claim the court may assume you admit it.');
    await I.see('You should also say if you accept any parts of the claim.');
    await I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    await I.see('Your response will be sent to ');
    await I.fillField(fields.text, 'Test reason');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = WhyDoYouDisagree;

const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  text: 'textarea[id="text"]',
};

class WhyDoYouDisagree {
  async enterReason (claimRef) {
    await I.amOnPage('/case/'+claimRef+'/response/your-defence');
    await I.waitForContent('Why do you disagree with the claim?', config.WaitForText);
    await I.see('Briefly explain why you disagree with the claim');
    await I.see('If you fail to dispute any part of the claim the court may assume you admit it.');
    await I.see('You should also say if you accept any parts of the claim.');
    await I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    await I.see('Your response will be sent to ');
    await I.fillField(fields.text, 'Test reason');
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = WhyDoYouDisagree;

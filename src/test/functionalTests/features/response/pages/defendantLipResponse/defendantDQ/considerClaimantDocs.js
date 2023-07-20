const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  text: 'textarea[id="details"]',
};

class ConsiderClaimantDocs {

  async SelectConsiderClaimantDocs() {
    await I.waitForText('Are there any documents the other party has that you want the court to consider?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.text,'Test Reason');
    await I.click('Save and continue');
  }
}

module.exports = ConsiderClaimantDocs;

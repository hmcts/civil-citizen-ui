const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  text: 'textarea[id="claimantDocumentsConsideredDetails"]',
};

class ClaimantDocsToBeConsider {

  async SelectClaimantDocs() {
    await I.waitForContent('Are there any documents the claimants have that you want the court to consider?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
    await I.waitForContent('Claimant documents to be considered', config.WaitForText);
    await I.see('What are the documents the claimants have that you want the court to consider?');
    await I.fillField(fields.text,'Test court to consider');
    await I.click('Save and continue');
  }
}

module.exports = ClaimantDocsToBeConsider;

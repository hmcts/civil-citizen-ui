
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  text: 'textarea[id="details"]',
};

class ConsiderClaimantDocs {

  async SelectConsiderClaimantDocs() {
    await I.see('Are there any documents the other party has that you want the court to consider?', 'h1');
    await I.click(fields.yesButton);
    await I.fillField(fields.text,'Test Reason');
    await I.click('Save and continue');
  }
}

module.exports = ConsiderClaimantDocs;

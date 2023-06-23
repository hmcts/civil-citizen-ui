
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  text: 'textarea[id="details"]',
};

class ConsiderClaimantDocs {

  SelectConsiderClaimantDocs() {
    I.see('Are there any documents the other party has that you want the court to consider?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.text,'Test Reason');
    I.click('Save and continue');
  }
}

module.exports = ConsiderClaimantDocs;

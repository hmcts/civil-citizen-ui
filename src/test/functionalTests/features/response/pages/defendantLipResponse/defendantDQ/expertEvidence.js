
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class ExpertEvidence {

  async SelectOptionForExpertEvidence() {
    await I.see('Do you want to use expert evidence?', 'h1');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = ExpertEvidence;

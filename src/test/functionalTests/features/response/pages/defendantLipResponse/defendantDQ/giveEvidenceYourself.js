
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class GiveEvidenceYourself {

  async SelectGiveEvidenceYourself() {
    await I.see('Do you want to give evidence yourself?', 'h1');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = GiveEvidenceYourself;

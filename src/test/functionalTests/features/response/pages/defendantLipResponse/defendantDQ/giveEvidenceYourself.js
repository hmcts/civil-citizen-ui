const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class GiveEvidenceYourself {

  async SelectGiveEvidenceYourself() {
    await I.waitForText('Do you want to give evidence yourself?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = GiveEvidenceYourself;

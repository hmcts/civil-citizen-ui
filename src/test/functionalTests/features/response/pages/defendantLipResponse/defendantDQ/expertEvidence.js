const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class ExpertEvidence {

  async SelectOptionForExpertEvidence() {
    await I.waitForText('Do you want to use expert evidence?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = ExpertEvidence;

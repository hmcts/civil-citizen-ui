const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class HearingRequirements {

  async selectHearingRequirements(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/directions-questionnaire/determination-without-hearing');
    await I.waitForText('Determination without Hearing Questions', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = HearingRequirements;

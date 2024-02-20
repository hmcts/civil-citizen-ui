const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class TriedToSettle {

  async selectTriedToSettle(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/directions-questionnaire/tried-to-settle');
    await I.waitForText('Have you tried to settle this claim before going to court?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = TriedToSettle;

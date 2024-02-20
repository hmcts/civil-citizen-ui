const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class RequestExtraFourWeeks {

  async SelectExtraFourWeeksToSettle() {
    await I.waitForText('Do you want an extra 4 weeks to try to settle the claim?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click('Save and continue');
  }
}

module.exports = RequestExtraFourWeeks;

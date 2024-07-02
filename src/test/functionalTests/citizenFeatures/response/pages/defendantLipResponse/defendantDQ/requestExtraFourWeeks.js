const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]',
};

class RequestExtraFourWeeks {

  async SelectExtraFourWeeksToSettle() {
    await I.waitForContent('Do you want an extra 4 weeks to try to settle the claim?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click('Save and continue');
  }
}

module.exports = RequestExtraFourWeeks;

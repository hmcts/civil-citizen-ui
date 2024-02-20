const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class SharedExpert {

  async SelectOptionForSharedExpert() {
    await I.waitForText('Do you want to share an expert with the other party?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = SharedExpert;

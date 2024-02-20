const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  firstWitnessFirstName: 'input[id="witnessItems[0][firstName]"]',
  firstWitnessLastName: 'input[id="witnessItems[0][lastName]"]',
  firstWitnessEmail:'input[id="witnessItems[0][email]"]',
  firstWitnessTelephone: 'input[id="witnessItems[0][telephone]"]',
  firstWitessDetails: 'textarea[id="witnessItems[0][details]"]',
};

class DefendantWitnesses {

  async enterDefendantWitnesses() {
    await I.waitForText('Do you have other witnesses?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.firstWitnessFirstName, 'WitnessFName');
    await I.fillField(fields.firstWitnessLastName, 'WitnessLName');
    await I.fillField(fields.firstWitnessEmail, 'test@test.com');
    await I.fillField(fields.firstWitnessTelephone, '09797979797');
    await I.fillField(fields.firstWitessDetails, 'TestWitnesses');
    await I.click('Save and continue');
  }
}

module.exports = DefendantWitnesses;

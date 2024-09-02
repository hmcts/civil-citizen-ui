const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  firstWitnessFirstName: 'input[id="witnessItems[0][firstName]"]',
  firstWitnessLastName: 'input[id="witnessItems[0][lastName]"]',
  firstWitnessEmail:'input[id="witnessItems[0][email]"]',
  firstWitnessTelephone: 'input[id="witnessItems[0][telephone]"]',
  firstWitessDetails: 'textarea[id="witnessItems[0][details]"]',
};

const content = {
  heading: {
    en: 'Do you have other witnesses?',
    cy: 'A oes gennych chi dystion eraill?',
  },
};

const inputs = {
  firstWitessDetails: {
    en: 'Test Witness Details',
    cy: 'Manylion Tyst Prawf',
  },
};

class DefendantWitnesses {

  async enterDefendantWitnesses() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.firstWitnessFirstName, 'WitnessFirstName');
    await I.fillField(fields.firstWitnessLastName, 'WitnessLastName');
    await I.fillField(fields.firstWitnessEmail, 'witness@witness.com');
    await I.fillField(fields.firstWitnessTelephone, '09797979797');
    await I.fillField(fields.firstWitessDetails, inputs.firstWitessDetails[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = DefendantWitnesses;

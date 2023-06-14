
const I = actor();

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

  enterDefendantWitnesses(option = 'Yes') {
    I.see('Do you have other witnesses?', 'h1');
    I.see('This is someone who can confirm your version of events.');
    switch (option) {
      case 'Yes': {
        I.click(fields.yesButton);
        I.fillField(fields.firstWitnessFirstName, 'WitnessFName');
        I.fillField(fields.firstWitnessLastName, 'WitnessLName');
        I.fillField(fields.firstWitnessEmail, 'test@test.com');
        I.fillField(fields.firstWitnessTelephone, '09797979797');
        I.fillField(fields.firstWitessDetails, 'TestWitnesses');
        break;
      }
      case 'No': {
        I.click(fields.noButton);
        break;
      }
      default:
        I.click(fields.yesButton);
    }

    I.click('Save and continue');
  }
}

module.exports = DefendantWitnesses;

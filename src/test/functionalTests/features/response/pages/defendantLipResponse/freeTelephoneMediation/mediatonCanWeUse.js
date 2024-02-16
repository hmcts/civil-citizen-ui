const I = actor();
const config = require('../../../../../../config');
const {language} = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  phoneNumberID: 'input[id="mediationPhoneNumber"]',
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  }
}

const content = {
  heading: {
    en: 'Enter a phone number',
    cy: 'Rhowch rif ffôn'
  },
  descriptionText: {
    en: 'Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.',
    cy: 'Nodwch rif ffôn uniongyrchol gall y gwasanaeth cyfryngu ei ddefnyddio i gysylltu â chi. Ni fyddwn yn rhoi\'r rhif i rywun arall.'
  }
}

class MediationCanWeUse {

  async selectOptionForMediation() {
    // await I.see('Confirm your telephone number', 'h1');
    // await I.see('Can the mediation service use');
    // await I.click(fields.yesButton);
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.fillField(fields.phoneNumberID, '02088908876');
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = MediationCanWeUse;

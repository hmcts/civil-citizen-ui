const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  phoneNumberID: 'input[id="mediationPhoneNumber"]',
};

const content = {
  heading1: {
    en: 'Enter a phone number',
    cy: 'Rhowch rif ffôn',
  },
  descriptionText1: {
    en: 'Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.',
    cy: 'Nodwch rif ffôn uniongyrchol gall y gwasanaeth cyfryngu ei ddefnyddio i gysylltu â chi. Ni fyddwn yn rhoi\'r rhif i rywun arall.',
  },
  heading2: {
    en: 'Confirm your telephone number',
    cy: 'Cadarnhewch eich rhif ffôn',
  },
  descriptionText2: {
    en: 'Can the mediation service use',
    cy: 'A all y gwasanaeth cyfryngu ddefnyddio’r rhif',
  },
};

class MediationCanWeUse {

  async selectOptionForMediation() {
    const { language } = sharedData;
    await I.waitForContent(content.heading2[language], config.WaitForText);
    await I.see(content.descriptionText2[language]);
    await I.click(fields.yesButton);
    // await I.waitForContent(content.heading1[language], config.WaitForText);
    // await I.see(content.descriptionText1[language]);
    // await I.fillField(fields.phoneNumberID, '02088908876');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = MediationCanWeUse;
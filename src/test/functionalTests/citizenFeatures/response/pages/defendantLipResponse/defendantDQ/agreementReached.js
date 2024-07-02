const config =  require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');
const I = actor();

const fields ={
  yesButton: 'input[value="YES"]',
  noAgreementLikelyButton: 'input[value="NO_BUT_AN_AGREEMENT_IS_LIKELY"]',
  noButton: 'input[value="NO"]',
};

const content = {
  heading: {
    en: 'Disclosure of electronic documents',
  },
  descriptionText: {
    en: 'Has an agreement been reached between the parties involved in the claim about what electronic documents will be disclosed?',
  },
};

class AgreementReached {
  async selectAgreementReached() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.click(fields.noAgreementLikelyButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = AgreementReached;

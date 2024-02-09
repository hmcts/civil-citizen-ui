const I = actor();
const config = require('../../../../../config');

const fields = {
  en: 'input[id="option"]',
  cy: 'input[id="option-2"]',
};

const pageContent = {
  languagePreferenceHeading: {
    en: 'Language',
    cy: 'Iaith'
  },
  languagePreferenceText: {
    en: 'You must choose which language to use to respond to this claim',
    cy: 'Mae\'n rhaid ichi ddewis pa iaith yr hoffech ei defnyddio i ymateb i\'r hawliad hwn.'
  },
  saveAndContinueButtonText: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  }
}

class BilingualLanguagePreference {

  async verifyContent(language = 'en') {
    await I.waitForText(pageContent.languagePreferenceHeading[language], config.WaitForText);
    await I.see(pageContent.languagePreferenceText[language]);
    I.click(fields[language]);
    await I.click(pageContent.saveAndContinueButtonText[language]);
  }

  async verifyContentError() {
    await I.waitForText('Language', config.WaitForText);
    await I.see('You must choose which language to use to respond to this claim');
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Select Welsh if you want to respond to this claim in Welsh');
  }
}

module.exports = BilingualLanguagePreference;

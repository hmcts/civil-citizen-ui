const I = actor();
const config = require('../../../../../config');
const sharedData = require('../../../../sharedData');
const cButtons = require('../../../../commonComponents/cButtons');

const  fields = {
  en: 'input[id="option"]',
  cy: 'input[id="option-2"]',
  both: 'input[id="option-3"]',
};

const content = {
  heading: {
    en: 'Language',
    cy: 'Iaith',
    both: 'Language',
  },
  descriptionText: {
    en: 'You must choose which language to use to respond to this claim',
    cy: 'Mae\'n rhaid ichi ddewis pa iaith yr hoffech ei defnyddio i ymateb i\'r hawliad hwn.',
    both: 'In which language do you want to respond to this claim?',
  },
};

class BilingualLanguagePreference {

  async verifyContent(languageOption = 'en') {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    I.click(fields[languageOption]);
    await I.click(cButtons.saveAndContinue[language]);
    sharedData.language = languageOption;
  }

  async verifyContentError() {
    await I.waitForContent('Language', config.WaitForText);
    await I.see('You must choose which language to use to respond to this claim');
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Select which language you want to respond to this claim in');
  }
}

module.exports = BilingualLanguagePreference;

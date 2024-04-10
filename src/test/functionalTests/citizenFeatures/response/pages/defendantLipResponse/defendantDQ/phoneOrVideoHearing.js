const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  details: 'textarea[id="details"]',
};

const content = {
  heading: {
    en: 'Do you want to ask for a telephone or video hearing?',
    cy: 'Ydych chi eisiau gwneud cais i gael gwrandawiad dros y ffôn neu wrandawiad fideo?',
  },
  descriptionText: {
    en: 'The judge will decide if the hearing can be held by telephone or video.',
    cy: 'Bydd y barnwr yn penderfynu a ellir cynnal y gwrandawiad dros y ffôn neu drwy fideo.',
  },
};

const inputs = {
  details: {
    en: 'Test details',
    cy: 'Manylion Prawf',
  },
};

class PhoneOrVideoHearing {

  async selectOptionForPhoneOrVideoHearing() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.click(fields.yesButton);
    await I.fillField(fields.details, inputs.details[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = PhoneOrVideoHearing;

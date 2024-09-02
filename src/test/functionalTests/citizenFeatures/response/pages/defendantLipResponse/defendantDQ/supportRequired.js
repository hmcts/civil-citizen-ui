const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="model[option]"]',
  noButton: 'input[id="model[option]-2"]',
  person1Dropdown: 'select[id="model[items][0][fullName]"]',
  person2Dropdown: 'select[id="model[items][1][fullName]"]',
  person1HearingLoop: 'input[id="declared-0-hearingLoop"]',
  person1SignLanguage: 'input[id="declared-0-signLanguageInterpreter"]',
  person1SignLanguageText: 'input[id="model[items][0][signLanguageInterpreter][content]"]',
  person2DisabledAccess: 'input[id="declared-1-disabledAccess"]',
  person2OtherSupport: 'input[id="declared-1-otherSupport"]',
  person2OtherSupportText: 'textarea[id="model[items][1][otherSupport][content]"]',
};

const content = {
  heading: {
    en: 'Do you, your experts or witnesses need support to attend a hearing',
    cy: 'Ydych chi, eich arbenigwyr neu eich tystion angen cymorth i allu mynychu gwrandawiad?',
  },
};

// const buttons = {
//   addPerson: {
//     en: 'Add another person',
//     cy: 'Ychwanegu unigolyn arall',
//   },
// };

const inputs = {
  person1SignLanguage: {
    en: 'Spanish',
    cy: 'Sbaeneg',
  }, 
  person2OtherSupport: {
    en: 'No support required',
    cy: 'Dim cymorth sydd ei angen',
  },
};

class SupportRequired {

  async selectOptionForSupportRequired() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.selectOption(fields.person1Dropdown, 'WitnessFirstName WitnessLastName');
    await I.click(fields.person1HearingLoop);
    await I.click(fields.person1SignLanguage);
    await I.fillField(fields.person1SignLanguageText, inputs.person1SignLanguage[language]);
    // await I.click(buttons.addPerson[language]);
    // await I.selectOption(fields.person2Dropdown, 'John Doe');
    // await I.click(fields.person2DisabledAccess);
    // await I.click(fields.person2OtherSupport);
    // await I.fillField(fields.person2OtherSupportText, inputs.person2OtherSupport[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = SupportRequired;

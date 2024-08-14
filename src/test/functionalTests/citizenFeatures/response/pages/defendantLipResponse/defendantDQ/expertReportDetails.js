const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  expertFirstName:'input[id="items[0][firstName]"]',
  expertLastName:'input[id="items[0][lastName]"]',
  fieldOfExpertise:'input[id="items[0][fieldOfExpertise]"]',
  whyNeedExpert:'textarea[id="items[0][whyNeedExpert]"]',
};

const content = {
  heading: {
    en: 'Have you already got a report written by an expert?',
    cy: 'A oes gennych adroddiad wedi’i ysgrifennu gan arbenigwr yn barod?',
  },
};

class ExpertReportDetails {

  async expertDetails() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.expertFirstName,'TestExpert1');
    await I.fillField(fields.expertLastName,'Test1LastName');
    await I.fillField(fields.fieldOfExpertise,'Reporting');
    await I.fillField(fields.whyNeedExpert,'to show solid proof');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = ExpertReportDetails;

const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  firstExpertsName: 'input[id="reportDetails[0][expertName]"]',
  firstExpertReportDay:'input[id="reportDetails[0][day]"]',
  firstExpertReportMonth: 'input[id="reportDetails[0][month]"]',
  firstExpertReportYear: 'input[id="reportDetails[0][year]"]',
  claimantExpertFirstName:'input[@id="items[0][firstName]"]',
  claimantExpertLastName:'input[@id="items[0][lastName]"]',
  claimantFieldOfExpertise:'input[@id="items[0][fieldOfExpertise]"]',
  claimantWhyNeedExpert:'textarea[@id="items[0][whyNeedExpert]"]',
};

const content = {
  heading: {
    en: 'Have you already got a report written by an expert?',
    cy: 'A oes gennych adroddiad wedi’i ysgrifennu gan arbenigwr yn barod?',
  },
};

class ExpertReportDetails {

  async enterExpertReportDetails() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.firstExpertsName,  'TestExpert1');
    await I.fillField(fields.firstExpertReportDay, '20');
    await I.fillField(fields.firstExpertReportMonth, '10');
    await I.fillField(fields.firstExpertReportYear, '2022');
    await I.click(cButtons.saveAndContinue[language]);
  }
  async claimantExpertDetails() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.claimantExpertFirstName,'TestExpert1');
    await I.fillField(fields.claimantExpertLastName,'Test1LastName');
    await I.fillField(fields.claimantFieldOfExpertise,'Reporting');
    await I.fillField(fields.claimantWhyNeedExpert,'to show solid proof');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = ExpertReportDetails;

const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  firstExpertsName: 'input[id="reportDetails[0][expertName]"]',
  firstExpertReportDay:'input[id="reportDetails[0][day]"]',
  firstExpertReportMonth: 'input[id="reportDetails[0][month]"]',
  firstExpertReportYear: 'input[id="reportDetails[0][year]"]',
};

const content = {
  heading: {
    en: 'Have you already got a report written by an expert?',
    cy: 'A oes gennych adroddiad wedi’i ysgrifennu gan arbenigwr yn barod?',
  },
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

class ExpertReportDetails {

  async enterExpertReportDetails() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.firstExpertsName,  'TestExpert1');
    await I.fillField(fields.firstExpertReportDay, '20');
    await I.fillField(fields.firstExpertReportMonth, '10');
    await I.fillField(fields.firstExpertReportYear, '2022');
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = ExpertReportDetails;

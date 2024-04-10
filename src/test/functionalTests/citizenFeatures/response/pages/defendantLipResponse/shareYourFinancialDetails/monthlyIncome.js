const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  incomeFromJobPayment: 'input[id="model[job][transactionSource][amount]"]',
  incomeFromJobPaymentSchedule: 'input[id="model[job][transactionSource][schedule]-4"]',
  childBenefitPayment: 'input[id="model[childBenefit][transactionSource][amount]"]',
  childBenefitSchedule: 'input[id="model[childBenefit][transactionSource][schedule]"]',
  otherIncomeSource: 'input[id="model[other][transactionSources][0][name]"]',
  otherIncomePayment: 'input[id="model[other][transactionSources][0][amount]"]',
  otherIncomePaymentSchedule: 'input[id="model[other][transactionSources][0][schedule]-4"]',
};

const checkboxes = {
  incomeFromJob: {
    en: 'Income from your job',
    cy: 'Incwm o’ch swydd',
  },
  childBenefit: {
    en: 'Child Benefit',
    cy: 'Budd-dal Plant',
  },
  otherIncome: {
    en: 'Other',
    cy: 'Arall',
  },
};

const content = {
  heading: {
    en: 'What regular income do you receive?',
    cy: 'Pa incwm rheolaidd ydych chi’n ei gael?',
  },
};

const inputs = {
  otherIncomeSource: {
    en: 'Rent',
    cy: 'Rhent',
  },
};

class MonthlyIncome {

  async selectIncomeFromJob(incomeAmount) {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.checkOption(checkboxes.incomeFromJob[language]);
    await I.fillField(fields.incomeFromJobPayment, incomeAmount);
    await I.click(fields.incomeFromJobPaymentSchedule);
  }

  async selectChildBenefit(childBenefitAmount) {
    await I.checkOption(checkboxes.childBenefit[sharedData.language]);
    await I.fillField(fields.childBenefitPayment, childBenefitAmount);
    await I.click(fields.childBenefitSchedule);
  }

  async selectOtherIncome(otherIncomeAmount) {
    const { language } = sharedData;
    await I.checkOption(checkboxes.otherIncome[language]);
    await I.fillField(fields.otherIncomeSource, inputs.otherIncomeSource[language]);
    await I.fillField(fields.otherIncomePayment, otherIncomeAmount);
    await I.click(fields.otherIncomePaymentSchedule);
  }

  async clickContinue() {
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = MonthlyIncome;

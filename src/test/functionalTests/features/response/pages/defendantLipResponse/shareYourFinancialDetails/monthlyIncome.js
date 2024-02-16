const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  incomeFromJob: 'Income from your job',
  incomeFromJobPayment: 'input[id="model[job][transactionSource][amount]"]',
  incomeFromJobPaymentSchedule: 'input[id="model[job][transactionSource][schedule]-4"]',
  childBenefit: 'Child Benefit',
  childBenefitPayment: 'input[id="model[childBenefit][transactionSource][amount]"]',
  childBenefitSchedule: 'input[id="model[childBenefit][transactionSource][schedule]"]',
  otherIncome: 'Other',
  otherIncomeSource: 'input[id="model[other][transactionSources][0][name]"]',
  otherIncomePayment: 'input[id="model[other][transactionSources][0][amount]"]',
  otherIncomePaymentSchedule: 'input[id="model[other][transactionSources][0][schedule]-4"]',
};
const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  }
};

const content = {
  heading: {
    en: 'What regular income do you receive?',
    cy: 'Pa incwm rheolaidd ydych chi’n ei gael?'
  }
}

const inputs = {
  otherIncomeSource: {
    en: 'Rent',
    cy: 'Rhent'
  }
}

class MonthlyIncome {

  async selectIncomeFromJob(incomeAmount) {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.checkOption(fields.incomeFromJob);
    await I.fillField(fields.incomeFromJobPayment, incomeAmount);
    await I.click(fields.incomeFromJobPaymentSchedule);
  }

  async selectChildBenefit(childBenefitAmount) {
    await I.checkOption(fields.childBenefit);
    await I.fillField(fields.childBenefitPayment, childBenefitAmount);
    await I.click(fields.childBenefitSchedule);
  }

  async selectOtherIncome(otherIncomeAmount) {
    await I.checkOption(fields.otherIncome);
    await I.fillField(fields.otherIncomeSource, inputs.otherIncomeSource[language]);
    await I.fillField(fields.otherIncomePayment, otherIncomeAmount);
    await I.click(fields.otherIncomePaymentSchedule);
  }

  async clickContinue() {
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = MonthlyIncome;

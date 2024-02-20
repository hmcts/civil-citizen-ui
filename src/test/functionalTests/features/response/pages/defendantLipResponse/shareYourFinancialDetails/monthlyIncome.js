const I = actor();
const config = require('../../../../../../config');

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
  saveAndContinue: 'Save and continue',
};

class MonthlyIncome {

  async selectIncomeFromJob(incomeAmount) {
    await I.waitForText('What regular income do you receive?', config.WaitForText);
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
    await I.fillField(fields.otherIncomeSource, 'Rent');
    await I.fillField(fields.otherIncomePayment, otherIncomeAmount);
    await I.click(fields.otherIncomePaymentSchedule);
  }

  async clickContinue() {
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = MonthlyIncome;

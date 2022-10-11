const I = actor();

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

export class MonthlyIncome {

  selectIncomeFromJob(incomeAmount) {
    I.see('What regular income do you receive?', 'h1');
    I.checkOption(fields.incomeFromJob);
    I.fillField(fields.incomeFromJobPayment, incomeAmount);
    I.click(fields.incomeFromJobPaymentSchedule);
  }
  selectChildBenefit(childBenefitAmount) {
    I.checkOption(fields.childBenefit);
    I.fillField(fields.childBenefitPayment, childBenefitAmount);
    I.click(fields.childBenefitSchedule);
  }
  selectOtherIncome(otherIncomeAmount) {
    I.checkOption(fields.otherIncome);
    I.fillField(fields.otherIncomeSource, 'Rent');
    I.fillField(fields.otherIncomePayment, otherIncomeAmount);
    I.click(fields.otherIncomePaymentSchedule);
  }
  clickContinue() {
    I.click(buttons.saveAndContinue);
  }
}

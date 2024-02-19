const I = actor();
const config = require('../../../../../../config');
const { sharedData } = require('../../../../../sharedData');

const fields ={
  mortgage: 'Mortgage',
  mortgagePayment: 'input[id="model[mortgage][transactionSource][amount]"]',
  mortgagePaymentScheduleMonthly: 'input[id="model[mortgage][transactionSource][schedule]-4"]',
  councilTax: 'Council Tax',
  councilTaxPayment: 'input[id="model[councilTax][transactionSource][amount]"]',
  councilTaxPaymentScheduleMonthly: 'input[id="model[councilTax][transactionSource][schedule]-4"]',
  gas: 'Gas',
  gasPayment: 'input[id="model[gas][transactionSource][amount]"]',
  gasPaymentScheduleWeekly: 'input[id="model[gas][transactionSource][schedule]"]',
  electricity: 'Electricity',
  electricityPayment: 'input[id="model[electricity][transactionSource][amount]"]',
  electricityPaymentScheduleFortnightly: 'input[id="model[electricity][transactionSource][schedule]-2"]',
  foodAndHouseKeeping: 'Food and housekeeping',
  foodAndHouseKeepingPayment: 'input[id="model[foodAndHousekeeping][transactionSource][amount]"]',
  foodAndHouseKeepingPaymentSchedule: 'input[id="model[foodAndHousekeeping][transactionSource][schedule]"]',
  otherExpenses: 'Other expenses',
  otherExpensesSource: 'input[id="model[other][transactionSources][0][name]"]',
  otherExpensesPayment: 'input[id="model[other][transactionSources][0][amount]"]',
  otherExpensesPaymentSchedule: 'input[id="model[other][transactionSources][0][schedule]-4"]',
};
const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

const content = {
  heading: {
    en: 'What are your regular expenses?',
    cy: 'Beth yw eich costau rheolaidd?',
  },
};

const inputs = {
  otherExpenseSource: {
    en: 'Fuel',
    cy: 'Tanwydd',
  },
};

class MonthlyExpenses {

  async selectMortgage(mortgageAmount) {
    await I.waitForText(content.heading[sharedData.language], config.WaitForText);
    await I.checkOption(fields.mortgage);
    await I.fillField(fields.mortgagePayment, mortgageAmount);
    await I.click(fields.mortgagePaymentScheduleMonthly);
  }

  async selectCouncilTax(councilTaxAmount) {
    await I.checkOption(fields.councilTax);
    await I.fillField(fields.councilTaxPayment, councilTaxAmount);
    await I.click(fields.councilTaxPaymentScheduleMonthly);
  }

  async selectGas(gasAmount) {
    await I.checkOption(fields.gas);
    await I.fillField(fields.gasPayment, gasAmount);
    await I.click(fields.gasPaymentScheduleWeekly);
  }

  async selectElectricity(electricityAmount) {
    await I.checkOption(fields.electricity);
    await I.fillField(fields.electricityPayment, electricityAmount);
    await I.click(fields.electricityPaymentScheduleFortnightly);
  }

  async selectFoodAndHouseKeeping(foodAndHouseKeepingAmount) {
    await I.checkOption(fields.foodAndHouseKeeping);
    await I.fillField(fields.foodAndHouseKeepingPayment, foodAndHouseKeepingAmount);
    await I.click(fields.foodAndHouseKeepingPaymentSchedule);
  }

  async selectOtherExpenses(otherExpenses) {
    await I.checkOption(fields.otherExpenses);
    await I.fillField(fields.otherExpensesSource, inputs.otherExpenseSource[sharedData.language]);
    await I.fillField(fields.otherExpensesPayment, otherExpenses);
    await I.click(fields.otherExpensesPaymentSchedule);
  }

  async clickContinue() {
    await I.click(buttons.saveAndContinue[sharedData.language]);
  }
}

module.exports = MonthlyExpenses;

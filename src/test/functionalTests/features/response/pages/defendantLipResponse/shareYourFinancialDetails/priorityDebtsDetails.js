const I = actor();
const config = require('../../../../../../config');

const fields ={
  mortgage: 'Mortgage',
  mortgagePayment: 'input[id="model[mortgage][transactionSource][amount]"]',
  mortgagePaymentScheduleMonthly: 'input[id="model[mortgage][transactionSource][schedule]-4"]',
  councilTax: 'Council Tax or Community Charge',
  councilTaxPayment: 'input[id="model[councilTax][transactionSource][amount]"]',
  councilTaxPaymentScheduleMonthly: 'input[id="model[councilTax][transactionSource][schedule]-4"]',
  gas: 'Gas',
  gasPayment: 'input[id="model[gas][transactionSource][amount]"]',
  gasPaymentScheduleWeekly: 'input[id="model[gas][transactionSource][schedule]"]',
  electricity: 'Electricity',
  electricityPayment: 'input[id="model[electricity][transactionSource][amount]"]',
  electricityPaymentScheduleFortnightly: 'input[id="model[electricity][transactionSource][schedule]-2"]',
};
const buttons = {
  saveAndContinue: 'Save and continue',
};

class PriorityDebtsDetails {

  async selectMortgage(mortgageAmount) {
    await I.waitForText('Debts you\'re behind on', config.WaitForText);
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

  async clickContinue() {
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = PriorityDebtsDetails;

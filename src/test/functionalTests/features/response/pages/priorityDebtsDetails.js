const I = actor();

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

  selectMortgage(mortgageAmount) {
    I.see('Debts you\'re behind on', 'h1');
    I.checkOption(fields.mortgage);
    I.fillField(fields.mortgagePayment, mortgageAmount);
    I.click(fields.mortgagePaymentScheduleMonthly);
  }
  selectCouncilTax(councilTaxAmount) {
    I.checkOption(fields.councilTax);
    I.fillField(fields.councilTaxPayment, councilTaxAmount);
    I.click(fields.councilTaxPaymentScheduleMonthly);
  }
  selectGas(gasAmount) {
    I.checkOption(fields.gas);
    I.fillField(fields.gasPayment, gasAmount);
    I.click(fields.gasPaymentScheduleWeekly);
  }
  selectElectricity(electricityAmount) {
    I.checkOption(fields.electricity);
    I.fillField(fields.electricityPayment, electricityAmount);
    I.click(fields.electricityPaymentScheduleFortnightly);
  }
  clickContinue() {
    I.click(buttons.saveAndContinue);
  }
}

module.exports = PriorityDebtsDetails;

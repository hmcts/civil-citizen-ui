import I = CodeceptJS.I
import assert from 'assert';

const I: I = actor();

const fields ={
  mortgage: 'Mortgage',
  mortgagePayment: 'input[id="mortgage-payment-amount"]',
  mortgagePaymentScheduleMonthly: 'input[id="mortgage-payment-schedule-4"]',
  councilTax: 'Council Tax or Community Charge',
  councilTaxPayment: 'input[id="councilTax-payment-amount"]',
  councilTaxPaymentScheduleMonthly: 'input[id="councilTax-payment-schedule-4"]',
  gas: 'Gas',
  gasPayment: 'input[id="gas-payment-amount"]',
  gasPaymentScheduleWeekly: 'input[id="gas-payment-schedule"]',
  electricity: 'Electricity',
  electricityPayment: 'input[id="electricity-payment-amount"]',
  electricityPaymentScheduleFortnightly: 'input[id="electricity-payment-schedule-2"]',
};
const buttons = {
  saveAndContinue: 'Save and continue',
};

export class PriorityDebtsDetails {

  selectMortgage(mortgageAmount: string): void {
    I.see('Debts you\'re behind on', 'h1');
    I.checkOption(fields.mortgage);
    I.fillField(fields.mortgagePayment, mortgageAmount);
    I.click(fields.mortgagePaymentScheduleMonthly);
  }
  selectCouncilTax(councilTaxAmount: string): void {
    I.checkOption(fields.councilTax);
    I.fillField(fields.councilTaxPayment, councilTaxAmount);
    I.click(fields.councilTaxPaymentScheduleMonthly);
  }
  selectGas(gasAmount: string): void {
    I.checkOption(fields.gas);
    I.fillField(fields.gasPayment, gasAmount);
    I.click(fields.gasPaymentScheduleWeekly);
  }
  selectElectricity(electricityAmount: string): void {
    I.checkOption(fields.electricity);
    I.fillField(fields.electricityPayment, electricityAmount);
    I.click(fields.electricityPaymentScheduleFortnightly);
  }
  clickContinue(): void {
    I.click(buttons.saveAndContinue);
  }
}

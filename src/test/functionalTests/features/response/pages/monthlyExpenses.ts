import I = CodeceptJS.I
import assert from 'assert';

const I: I = actor();

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
  saveAndContinue: 'Save and continue',
};

export class MonthlyExpenses {

  selectMortgage(mortgageAmount: string): void {
    I.see('What are your regular expenses?', 'h1');
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
  selectFoodAndHouseKeeping(foodAndHouseKeepingAmount: string): void {
    I.checkOption(fields.foodAndHouseKeeping);
    I.fillField(fields.foodAndHouseKeepingPayment, foodAndHouseKeepingAmount);
    I.click(fields.foodAndHouseKeepingPaymentSchedule);
  }
  selectOtherExpenses(otherExpenses: string): void {
    I.checkOption(fields.otherExpenses);
    I.fillField(fields.otherExpensesSource, 'Fuel');
    I.fillField(fields.otherExpensesPayment, otherExpenses);
    I.click(fields.otherExpensesPaymentSchedule);
  }
  clickContinue(): void {
    I.click(buttons.saveAndContinue);
  }
}

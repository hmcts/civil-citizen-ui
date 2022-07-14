import I = CodeceptJS.I
import assert from 'assert';

const I: I = actor();

const fields ={
  yesButton: 'input[id="debtsRadio"]',
  noButton: 'input[id="debtsRadio-2"]',
  debtItem1: 'input[id="debtsItems[0][debt]"]',
  debtOwned1: 'input[id="debtsItems[0][totalOwned]"]',
  monthlyPayments1: 'input[id="debtsItems[0][monthlyPayments]"]',
  debtItem2: 'input[id="debtsItems[1][debt]"]',
  debtOwned2: 'input[id="debtsItems[1][totalOwned]"]',
  monthlyPayments2: 'input[id="debtsItems[1][monthlyPayments]"]',
  debtItem3: 'input[id="debtsItems[2][debt]"]',
  debtOwned3: 'input[id="debtsItems[2][totalOwned]"]',
  monthlyPayments3: 'input[id="debtsItems[2][monthlyPayments]"]',
};

const buttons = {
  addDebt: 'Add a debt',
  saveAndContinue: 'Save and continue',
};

export class Debts {

  clickYesButton(): void {
    I.see('Do you have loans or credit card debts?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.debtItem1, 'HSBC Credit card'),
    I.fillField(fields.debtOwned1, '1200'),
    I.fillField(fields.monthlyPayments1, '120'),
    I.fillField(fields.debtItem2, 'Motor vehicle loan'),
    I.fillField(fields.debtOwned2, '14000'),
    I.fillField(fields.monthlyPayments2, '220'),
    I.click(buttons.addDebt),
    I.fillField(fields.debtItem3, 'Student loan'),
    I.fillField(fields.debtOwned3, '8000'),
    I.fillField(fields.monthlyPayments3, '400'),
    I.click(buttons.saveAndContinue);
  }
  clickNoButton(): void {
    I.see('Do you have loans or credit card debts?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.saveAndContinue);
  }
}

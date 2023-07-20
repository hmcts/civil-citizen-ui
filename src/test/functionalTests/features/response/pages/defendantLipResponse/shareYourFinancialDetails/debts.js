const I = actor();
const config = require('../../../../../../config');

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

class Debts {

  async clickYesButton() {
    await I.waitForText('Do you have loans or credit card debts?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.debtItem1, 'HSBC Credit card'),
    await I.fillField(fields.debtOwned1, '1200'),
    await I.fillField(fields.monthlyPayments1, '120'),
    await I.fillField(fields.debtItem2, 'Motor vehicle loan'),
    await I.fillField(fields.debtOwned2, '14000'),
    await I.fillField(fields.monthlyPayments2, '220'),
    await I.click(buttons.addDebt),
    await I.fillField(fields.debtItem3, 'Student loan'),
    await I.fillField(fields.debtOwned3, '8000'),
    await I.fillField(fields.monthlyPayments3, '400'),
    await I.click(buttons.saveAndContinue);
  }

  async clickNoButton() {
    await I.waitForText('Do you have loans or credit card debts?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = Debts;

const I = actor();
const config = require('../../../../../../config');

const fields = {
  accounts1: 'accounts[0][typeOfAccount]',
  accounts2: 'accounts[1][typeOfAccount]',
  accounts3: 'accounts[2][typeOfAccount]',
  jointAccount1: 'accounts[0][joint]',
  jointAccount2: 'accounts[1][joint]',
  jointAccount3: 'accounts[2][joint]',
  account1Balance: 'input[id="accounts[0][balance]"]',
  account2Balance: 'input[id="accounts[1][balance]"]',
  account3Balance: 'input[id="accounts[2][balance]"]',
};

const buttons = {
  addAnotherAccount: 'Add another account',
  saveAndContinue: 'Save and continue',
};

class BankAccountsDetails {
  async enterBankAccountDetails() {
    await I.waitForText('List your bank and savings accounts', config.WaitForText);
    await I.selectOption(fields.accounts1, 'Current account');
    await I.selectOption(fields.jointAccount1, 'Yes');
    await I.fillField(fields.account1Balance, '2000');
  }

  async enterAdditionalBankAccountDetails() {
    await I.click(buttons.addAnotherAccount);
    await I.selectOption(fields.accounts3, 'ISA');
    await I.selectOption(fields.jointAccount3, 'No');
    await I.fillField(fields.account3Balance, '6000');
  }

  async clickContinue(){
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = BankAccountsDetails;

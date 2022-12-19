const I = actor();

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
  enterBankAccountDetails() {
    I.see('List your bank and savings accounts', 'h1');
    I.selectOption(fields.accounts1, 'Current account');
    I.selectOption(fields.jointAccount1, 'Yes');
    I.fillField(fields.account1Balance, '2000');
  }

  enterAdditionalBankAccountDetails() {
    I.click(buttons.addAnotherAccount);
    I.selectOption(fields.accounts3, 'ISA');
    I.selectOption(fields.jointAccount3, 'No');
    I.fillField(fields.account3Balance, '6000');
  }

  clickContinue(){
    I.click(buttons.saveAndContinue);
  }
}

module.exports = BankAccountsDetails;

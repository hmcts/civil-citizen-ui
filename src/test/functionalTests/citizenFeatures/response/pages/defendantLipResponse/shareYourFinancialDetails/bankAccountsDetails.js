const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

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

const content = {
  heading: {
    en: 'List your bank and savings accounts',
    cy: 'Rhestrwch eich cyfrifon banc a chyfrifon cynilo',
  },
};

const dropdownOptions = {
  accounts1:  {
    en: 'Current account',
    cy: 'Cyfrif cyfredol',
  },
  jointAccount1: {
    en: 'Yes',
    cy: 'Ie',
  },
};

const buttons = {
  addAnotherAccount: {
    en: 'Add another account',
    cy: 'Ychwanegu cyfrif arall',
  },
};

class BankAccountsDetails {
  async enterBankAccountDetails() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.selectOption(fields.accounts1, dropdownOptions.accounts1[language]);
    await I.selectOption(fields.jointAccount1, dropdownOptions.jointAccount1[language]);
    await I.fillField(fields.account1Balance, '2000');
  }

  async enterBankAccountDetailsError() {
    await I.waitForContent('List your bank and savings accounts', config.WaitForText);
    await I.selectOption(fields.accounts1, 'Current account');
    await I.see('Select a type of account');
    await I.see('Enter a valid number');
  }

  async enterBankAccountDetailsError() {
    await I.waitForText('List your bank and savings accounts', config.WaitForText);
    await I.selectOption(fields.accounts1, 'Current account');
    await I.see('Select a type of account');
    await I.see('Enter a valid number');
  }

  async enterAdditionalBankAccountDetails() {
    await I.click(buttons.addAnotherAccount);
    await I.selectOption(fields.accounts3, 'ISA');
    await I.selectOption(fields.jointAccount3, 'No');
    await I.fillField(fields.account3Balance, '6000');
  }

  async clickContinue(){
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = BankAccountsDetails;

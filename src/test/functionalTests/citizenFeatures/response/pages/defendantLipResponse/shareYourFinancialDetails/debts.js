const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

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
  addDebt: { 
    en: 'Add a debt', 
    cy: 'Ychwanegu dyled',
  },
};

const content = {
  heading: {
    en: 'Do you have loans or credit card debts?',
    cy: 'A oes gennych fenthyciadau neu ddyledion cerdyn credyd?',
  },
};

const inputs = {
  debtItem1: {
    en: 'HSBC Credit card',
    cy: 'Cerdyn credyd HSBC',
  },
  debtItem2: {
    en: 'Motor vehicle loan',
    cy: 'Benthyciad cerbyd modur',
  },
  debtItem3: {
    en: 'Student loan',
    cy: 'Benthyciad myfyriwr',
  },
};

class Debts {

  async clickYesButton() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.debtItem1, inputs.debtItem1[language]),
    await I.fillField(fields.debtOwned1, '1200'),
    await I.fillField(fields.monthlyPayments1, '120'),
    await I.fillField(fields.debtItem2,  inputs.debtItem2[language]),
    await I.fillField(fields.debtOwned2, '14000'),
    await I.fillField(fields.monthlyPayments2, '220'),
    await I.click(buttons.addDebt[language]),
    await I.fillField(fields.debtItem3, inputs.debtItem3[language]),
    await I.fillField(fields.debtOwned3, '8000'),
    await I.fillField(fields.monthlyPayments3, '400'),
    await I.click(cButtons.saveAndContinue[language]);
  }

  async clickNoButton() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = Debts;

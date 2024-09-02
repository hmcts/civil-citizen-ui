const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  mortgagePayment: 'input[id="model[mortgage][transactionSource][amount]"]',
  mortgagePaymentScheduleMonthly: 'input[id="model[mortgage][transactionSource][schedule]-4"]',
  councilTaxPayment: 'input[id="model[councilTax][transactionSource][amount]"]',
  councilTaxPaymentScheduleMonthly: 'input[id="model[councilTax][transactionSource][schedule]-4"]',
  gasPayment: 'input[id="model[gas][transactionSource][amount]"]',
  gasPaymentScheduleWeekly: 'input[id="model[gas][transactionSource][schedule]"]',
  electricityPayment: 'input[id="model[electricity][transactionSource][amount]"]',
  electricityPaymentScheduleFortnightly: 'input[id="model[electricity][transactionSource][schedule]-2"]',
};

const checkboxes = {
  mortgage: {
    en: 'Mortgage',
    cy: 'Morgais',
  },
  councilTax: {
    en: 'Council Tax or Community Charge',
    cy: 'Treth Cyngor',
  },
  gas: {
    en: 'Gas',
    cy: 'Nwy',
  },
  electricity: {
    en: 'Electricity',
    cy: 'Trydan',
  },
};

const content = {
  heading: {
    en: 'Debts you\'re behind on',
    cy: 'Dyledion rydych ar ei hôl hi yn eu talu',
  },
};

class PriorityDebtsDetails {

  async selectMortgage(mortgageAmount) {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.checkOption(checkboxes.mortgage[language]);
    await I.fillField(fields.mortgagePayment, mortgageAmount);
    await I.click(fields.mortgagePaymentScheduleMonthly);
  }

  async selectCouncilTax(councilTaxAmount) {
    await I.checkOption(checkboxes.councilTax[sharedData.language]);
    await I.fillField(fields.councilTaxPayment, councilTaxAmount);
    await I.click(fields.councilTaxPaymentScheduleMonthly);
  }

  async selectGas(gasAmount) {
    await I.checkOption(checkboxes.gas[sharedData.language]);
    await I.fillField(fields.gasPayment, gasAmount);
    await I.click(fields.gasPaymentScheduleWeekly);
  }

  async selectElectricity(electricityAmount) {
    await I.checkOption(checkboxes.electricity[sharedData.language]);
    await I.fillField(fields.electricityPayment, electricityAmount);
    await I.click(fields.electricityPaymentScheduleFortnightly);
  }

  async clickContinue() {
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = PriorityDebtsDetails;

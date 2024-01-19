const I = actor();
const config = require('../../../../../../config');

const fields ={
  paymentAmount: 'input[id="paymentAmount"]',
  rePaymentFrequency: 'input[id="repaymentFrequency-3"]',
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

const currentDate = new Date();
const day = currentDate.getDay() + 1;
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear() + 1;
const yearError = currentDate.getFullYear() - 50;
const dayError = currentDate.getDay() + 1000;
const monthError = currentDate.getMonth() - 1000;

class RepaymentPlan {
  async enterRepaymentPlan(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/response/full-admission/payment-plan');
    await I.waitForText('Your repayment plan', config.WaitForText);
    await I.fillField(fields.paymentAmount,'100');
    await I.click(fields.rePaymentFrequency);
    await I.fillField(fields.day, day.toString());
    await I.fillField(fields.month, month.toString());
    await I.fillField(fields.year, year.toString());
    await I.click(buttons.saveAndContinue);
  }

  async enterRepaymentPlanError(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/response/full-admission/payment-plan');
    await I.waitForText('Your repayment plan', config.WaitForText);
    await I.click('Save and continue');
    await I.see('There was a problem');
    //empty inputs error
    await I.see('Enter an amount of £1 or more');
    await I.see('Enter a valid day');
    await I.see('Enter a valid month');
    await I.see('Enter a valid year');
    await I.see('Choose a payment frequency');
    //past date error
    await I.fillField(fields.paymentAmount,'100');
    await I.click(fields.rePaymentFrequency);
    await I.fillField(fields.day, day.toString());
    await I.fillField(fields.month, month.toString());
    await I.fillField(fields.year, yearError.toString());
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Enter a first payment date in the future');
    //invalid date, month & year
    await I.fillField(fields.day, dayError.toString());
    await I.fillField(fields.month, monthError.toString());
    await I.fillField(fields.year, '20');
    await I.click(buttons.saveAndContinue);
    await I.see('There was a problem');
    await I.see('Enter a valid day');
    await I.see('Enter a valid month');
    await I.see('Enter a 4 digit year');
  }
}

module.exports = RepaymentPlan;

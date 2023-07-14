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
  saveAndContinue: 'button.govuk-button',
};

const currentDate = new Date();
const day = currentDate.getDay() + 1;
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear() + 1;

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
}

module.exports = RepaymentPlan;

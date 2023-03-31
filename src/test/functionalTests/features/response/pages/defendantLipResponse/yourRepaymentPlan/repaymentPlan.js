const I = actor();

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
  enterRepaymentPlan(claimRef) {
    I.amOnPage('/case/' + claimRef + '/response/full-admission/payment-plan');
    I.see('Your repayment plan', 'h1');
    I.fillField(fields.paymentAmount,'100');
    I.click(fields.rePaymentFrequency);
    I.fillField(fields.day, day.toString());
    I.fillField(fields.month, month.toString());
    I.fillField(fields.year, year.toString());
    I.click(buttons.saveAndContinue);
  }
}

module.exports = RepaymentPlan;

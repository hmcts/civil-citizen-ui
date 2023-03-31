const I = actor();

const fields = {
  amount: 'input[id="amount"]',
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};
const currentDate = new Date();
const day = currentDate.getDay();
const month = currentDate.getMonth();
const year = currentDate.getFullYear() - 1;

class HowMuchYouHavePaid {
    
  enterPaymentDetails(claimRef, amount) {
    I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-have-you-paid');
    I.see('How much have you paid the claimant?', 'h1');
    I.see('The total amount claimed is £');
    I.see('How much have you paid?');
    I.fillField(fields.amount, amount);
    I.see('When did you pay this amount?');
    I.see('For example, ');
    I.fillField(fields.day, day.toString());
    I.fillField(fields.month, month.toString());
    I.fillField(fields.year, year.toString());
    I.see('How did you pay this amount?');
    I.fillField(fields.text, 'Bank transfer');
    I.click(buttons.saveAndContinue);    
  }
}

module.exports = HowMuchYouHavePaid;
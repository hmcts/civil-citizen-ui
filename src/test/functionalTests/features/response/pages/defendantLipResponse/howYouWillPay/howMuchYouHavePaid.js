const I = actor();
const config = require('../../../../../../config');

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

  async enterPaymentDetails(claimRef, amount, responseType) {
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-have-you-paid');
      await I.waitForText('How much have you paid the claimant?', config.WaitForText);
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/how-much-have-you-paid');
      await I.waitForText('How much have you paid?', config.WaitForText);
    }
    await I.see('The total amount claimed is £');
    await I.see('How much have you paid?');
    await I.fillField(fields.amount, amount);
    await I.see('When did you pay this amount?');
    await I.see('For example, ');
    await I.fillField(fields.day, day.toString());
    await I.fillField(fields.month, month.toString());
    await I.fillField(fields.year, year.toString());
    await I.see('How did you pay this amount?');
    await I.fillField(fields.text, 'Bank transfer');
    await I.click(buttons.saveAndContinue);
  }

  async enterPaymentDetailsError(claimRef, amount, responseType) {
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-have-you-paid');
      await I.waitForText('How much have you paid the claimant?', config.WaitForText);
      await I.click(buttons.saveAndContinue);
      await I.see('There was a problem');
      await I.see('Enter a valid amount');
      await I.see('Enter a valid day');
      await I.see('Enter a valid month');
      await I.see('Enter a valid year');
      await I.see('Enter text explaining how you paid');
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/how-much-have-you-paid');
      await I.waitForText('How much have you paid?', config.WaitForText);
      await I.click(buttons.saveAndContinue);
      await I.see('There was a problem');
      await I.see('Enter a valid amount');
      await I.see('Enter a valid day');
      await I.see('Enter a valid month');
      await I.see('Enter a valid year');
      await I.see('Enter text explaining how you paid');
    }
  }
}

module.exports = HowMuchYouHavePaid;

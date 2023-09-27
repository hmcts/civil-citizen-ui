const I = actor();
const config = require('../../../../../../config');

const fields = {
  responseAdmitAllImmediate: 'input[id="paymentType"]',
  responseAdmitAllBySetDate: 'input[id="paymentType-2"]',
  responseAdmitAllRepayment: 'input[id="paymentType-3"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class PaymentOptionPage {
  async enterPaymentOption(claimRef, responseType, paymentType) {
    await I.amOnPage('/case/'+claimRef+'/response/'+responseType+'/payment-option');
    await I.waitForText('When do you want to pay', config.WaitForText);
    switch (paymentType){
      case 'immediate':{
        await I.click(fields.responseAdmitAllImmediate);
        break;
      }
      case 'bySetDate':{
        await I.click(fields.responseAdmitAllBySetDate);
        break;
      }
      case 'repaymentPlan':{
        await I.click(fields.responseAdmitAllRepayment);
        break;
      }
      default:{
        await I.click(fields.responseAdmitAllImmediate);
        break;
      }
    }
    await I.click(buttons.saveAndContinue);
  }

  async enterPaymentOptionError(claimRef, responseType, paymentType) {
    await I.amOnPage('/case/'+claimRef+'/response/'+responseType+'/payment-option');
    await I.waitForText('When do you want to pay', config.WaitForText);
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Choose a payment option');
    switch (paymentType){
      case 'bySetDate':{
        // await I.click(fields.responseAdmitAll);
        await I.click(fields.responseAdmitAllBySetDate);
        await I.click('Save and continue');
        await I.amOnPage('/case/'+claimRef+'/response/full-admission/payment-date');
        await I.see('What date will you pay on?');
        await I.click('Save and continue');
        await I.see('There was a problem');
        await I.see('Enter a valid day');
        await I.see('Enter a valid month');
        await I.see('Enter a valid year');
        break;
      }
    }
  }
}

module.exports = PaymentOptionPage;

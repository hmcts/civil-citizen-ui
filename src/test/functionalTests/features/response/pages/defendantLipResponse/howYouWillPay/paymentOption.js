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

  async enterPaymentOptionWelsh(claimRef, responseType, paymentType) {
    await I.amOnPage('/case/'+claimRef+'/response/'+responseType+'/payment-option');
    await I.waitForText('Pryd ydych chi eisiau talu?', config.WaitForText);
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
}

module.exports = PaymentOptionPage;

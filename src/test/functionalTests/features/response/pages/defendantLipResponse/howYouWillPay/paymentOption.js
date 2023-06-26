const I = actor();

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
    await I.see('When do you want to pay', 'h1');
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

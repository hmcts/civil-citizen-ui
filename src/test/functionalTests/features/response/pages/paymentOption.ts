import I = CodeceptJS.I

const I: I = actor();

const fields = {
  responseAdmitAllImmediate: 'input[id="paymentType"]',
  responseAdmitAllBySetDate: 'input[id="paymentType-2"]',
  responseAdmitAllRepayment: 'input[id="paymentType-3"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

export class PaymentOptionPage {
  enterPaymentOption(claimRef, paymentType): void{
    I.amOnPage('/case/'+claimRef+'/response/full-admission/payment-option');
    switch (paymentType){
      case 'immediate':{
        I.click(fields.responseAdmitAllImmediate);
        break;
      }
      case 'bySetDate':{
        I.click(fields.responseAdmitAllBySetDate);
        break;
      }
      case 'repaymentPlan':{
        I.click(fields.responseAdmitAllRepayment);
        break;
      }
      default:{
        I.click(fields.responseAdmitAllImmediate);
        break;
      }
    }
    I.click(buttons.saveAndContinue);
  }
}

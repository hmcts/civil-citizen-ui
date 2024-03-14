const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields = {
  responseAdmitAllImmediate: 'input[id="paymentType"]',
  responseAdmitAllBySetDate: 'input[id="paymentType-2"]',
  responseAdmitAllRepayment: 'input[id="paymentType-3"]',
};

const content = {
  heading: {
    en: 'When do you want to pay',
    cy: 'Pryd ydych chi eisiau talu',
  },
};

const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

class PaymentOptionPage {
  async enterPaymentOption(claimRef, responseType, paymentType) {
    await I.amOnPage('/case/'+claimRef+'/response/'+responseType+'/payment-option');
    await I.waitForContent(content.heading[sharedData.language], config.WaitForText);
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

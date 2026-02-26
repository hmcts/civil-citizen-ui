const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields = {
  responseAdmitAll: 'input[id="responseType"]',
  responsePartAdmit: 'input[id="responseType-2"]',
  responseRejectAll: 'input[id="responseType-3"]',
  responseAdmitAllBySetDate: 'input[id="paymentType-2"]',
};

const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

const content = {
  heading: {
    en: 'How do you respond to the claim?',
    cy: 'Sut ydych chi\'n ymateb i\'r hawliad?',
  },
};

class ResponseTypePage {
  async enterResponseToClaim(claimRef, responseType){
    await I.amOnPage('/case/'+claimRef+'/response/response-type');
    await I.waitForContent(content.heading[sharedData.language], config.WaitForText);
    switch (responseType){
      case 'full-admission':{
        await I.click(fields.responseAdmitAll);
        break;
      }
      case 'partial-admission':{
        await I.click(fields.responsePartAdmit);
        break;
      }
      case 'rejectAll':{
        await I.click(fields.responseRejectAll);
        break;
      }
      default:{
        await I.click(fields.responseAdmitAll);
        break;
      }
    }
    await I.click(buttons.saveAndContinue);
  }

  async enterResponseToClaimError(claimRef, responseType){
    await I.amOnPage('/case/'+claimRef+'/response/response-type');
    await I.waitForContent('How do you respond to the claim?', config.WaitForText);
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Select how you respond to the claim');
    switch (responseType){
      case 'partial-admission':{
        await I.click(fields.responsePartAdmit);
        await I.click('Save and continue');
        await I.see('Have you paid the claimant the amount you admit you owe?');
        await I.click('Save and continue');
        await I.see('There was a problem');
        await I.see('Select if you have paid the claimant what you admit you owe or not');
        break;
      }
      case 'rejectAll':{
        await I.click(fields.responseRejectAll);
        await I.click('Save and continue');
        await I.click('Save and continue');
        await I.see('There was a problem');
        await I.see('Select why you don\'t believe you owe Test Inc any money');
        break;
      }
    }
  }
}

module.exports = ResponseTypePage;

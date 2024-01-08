const I = actor();
const config = require('../../../../../../config');

const fields = {
  responseAdmitAll: 'input[id="responseType"]',
  responsePartAdmit: 'input[id="responseType-2"]',
  responseRejectAll: 'input[id="responseType-3"]',
  responseAdmitAllBySetDate: 'input[id="paymentType-2"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class RespondTypePage {
  async enterResponseToClaim(claimRef, responseType){
    await I.amOnPage('/case/'+claimRef+'/response/response-type');
    await I.waitForText('How do you respond to the claim?', config.WaitForText);
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

  async enterResponseToClaimWelsh(claimRef, responseType){
    await I.amOnPage('/case/'+claimRef+'/response/response-type');
    await I.waitForText('Sut ydych chi\'n ymateb i\'r hawliad?', config.WaitForText);
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
    await I.waitForText('How do you respond to the claim?', config.WaitForText);
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Choose your response');
    switch (responseType){
      case 'partial-admission':{
        await I.click(fields.responsePartAdmit);
        await I.click('Save and continue');
        await I.see('Have you paid the claimant the amount you admit you owe?');
        await I.click('Save and continue');
        await I.see('There was a problem');
        await I.see('Choose option: Yes or No');
        break;
      }
      case 'rejectAll':{
        await I.click(fields.responseRejectAll);
        await I.click('Save and continue');
        await I.click('Save and continue');
        await I.see('There was a problem');
        await I.see('Please select a response');
        break;
      }
    }
  }
}

module.exports = RespondTypePage;

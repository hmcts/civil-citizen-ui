const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('responseType');

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
        logger.info(`Reponse type full-admission - ${claimRef}`);
        await I.click(fields.responseAdmitAll);
        break;
      }
      case 'partial-admission':{
        logger.info(`Response type partial-admission - ${claimRef}`);
        await I.click(fields.responsePartAdmit);
        break;
      }
      case 'rejectAll':{
        logger.info(`Response type reject-all - ${claimRef}`);
        await I.click(fields.responseRejectAll);
        break;
      }
      default:{
        logger.info(`Response type default - ${claimRef}`);
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
    await I.see('Choose your response');
    switch (responseType){
      case 'partial-admission':{
        logger.info(`enterResponseToClaimError for partial-admission - ${claimRef} and responseType - ${responseType}`);
        await I.click(fields.responsePartAdmit);
        await I.click('Save and continue');
        await I.see('Have you paid the claimant the amount you admit you owe?');
        await I.click('Save and continue');
        await I.see('There was a problem');
        await I.see('Choose option: Yes or No');
        break;
      }
      case 'rejectAll':{
        logger.info(`enterResponseToClaimError for reject-all - ${claimRef} and responseType - ${responseType}`);
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

module.exports = ResponseTypePage;

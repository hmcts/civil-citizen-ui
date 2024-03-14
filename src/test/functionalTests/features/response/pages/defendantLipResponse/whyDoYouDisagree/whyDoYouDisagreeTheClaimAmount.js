const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields = {
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

const content = {
  heading: {
    en: 'Why do you disagree with the claim amount?',
    cy: 'Pam eich bod yn anghytuno â swm yr hawliad?',
  },
  hintText1: {
    en: 'The total amount claimed is £', 
    cy:'Y cyfanswm a hawlir yw £',
  },
  hintText2: {
    en: 'This includes the claim fee and any interest.', 
    cy:'Mae hyn yn cynnwys ffi\'r hawliad.',
  },
};

const inputs = {
  whyYouDisagree: {
    en: 'Test reason',
    cy: 'Rheswm Prawf',
  },
};

class WhyDoYouDisagreeTheClaimAmount {
  async enterReason (claimRef, responseType) {
    const { language } = sharedData; 
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/why-do-you-disagree');
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/why-do-you-disagree');
    }
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.hintText1[language]);
    await I.see(content.hintText2[language]);
    await I.fillField(fields.text, inputs.whyYouDisagree[language]);
    await I.click(buttons.saveAndContinue);
  }

  async enterReasonError (claimRef, responseType) {
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/why-do-you-disagree');
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/why-do-you-disagree');
    }
    await I.waitForContent('Why do you disagree with the claim amount?', config.WaitForText);
    await I.see('The total amount claimed is £');
    await I.see('This includes the claim fee and any interest.');
    await I.click(buttons.saveAndContinue);
    await I.see('There was a problem');
    await I.see('Enter text explaining why do you disagree');
  }
}

module.exports = WhyDoYouDisagreeTheClaimAmount;

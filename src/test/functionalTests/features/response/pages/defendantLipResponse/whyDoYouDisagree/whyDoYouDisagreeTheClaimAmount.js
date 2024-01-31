const I = actor();
const config = require('../../../../../../config');

const fields = {
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

class WhyDoYouDisagreeTheClaimAmount {
  async enterReason (claimRef, responseType) {
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/why-do-you-disagree');
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/why-do-you-disagree');
    }
    await I.waitForText('Why do you disagree with the claim amount?', config.WaitForText);
    await I.see('The total amount claimed is £');
    await I.see('This includes the claim fee and any interest.');
    await I.fillField(fields.text, 'Test reason');
    await I.click(buttons.saveAndContinue);
  }

  async enterReasonError (claimRef, responseType) {
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/why-do-you-disagree');
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/why-do-you-disagree');
    }
    await I.waitForText('Why do you disagree with the claim amount?', config.WaitForText);
    await I.see('The total amount claimed is £');
    await I.see('This includes the claim fee and any interest.');
    await I.click(buttons.saveAndContinue);
    await I.see('There was a problem');
    await I.see('Enter text explaining why do you disagree');
  }
}

module.exports = WhyDoYouDisagreeTheClaimAmount;

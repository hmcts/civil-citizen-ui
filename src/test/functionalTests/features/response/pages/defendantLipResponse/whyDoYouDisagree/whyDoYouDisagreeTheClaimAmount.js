const I = actor();

const fields = {
  text: 'textarea[id="text"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class WhyDoYouDisagreeTheClaimAmount {
  async enterReason (claimRef, responseType) {
    if(responseType == 'partial-admission'){
      await I.amOnPage('/case/'+claimRef+'/response/partial-admission/why-do-you-disagree');
    }else{
      await I.amOnPage('/case/'+claimRef+'/response/full-rejection/why-do-you-disagree');
    }
    await I.see('Why do you disagree with the claim amount?', 'h1');
    await I.see('The total amount claimed is £');
    await I.see('This includes the claim fee and any interest.');
    await I.fillField(fields.text, 'Test reason');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = WhyDoYouDisagreeTheClaimAmount;

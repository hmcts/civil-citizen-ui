const I = actor();

const fields = {
  responseAdmitAll: 'input[id="responseType"]',
  responsePartAdmit: 'input[id="responseType-2"]',
  responseRejectAll: 'input[id="responseType-3"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class RespondTypePage {
  async enterResponseToClaim(claimRef, responseType){
    await I.amOnPage('/case/'+claimRef+'/response/response-type');
    await I.see('How do you respond to the claim?', 'h1');
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
}

module.exports = RespondTypePage;

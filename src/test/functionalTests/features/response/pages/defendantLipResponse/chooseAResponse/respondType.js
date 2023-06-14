const I = actor();

const fields = {
  responseAdmitAll: 'input[id="responseType"]',
  responsePartAdmit: 'input[id="responseType-2"]',
  responseRejectAll: 'input[id="responseType-3"]',
};

const buttons = {
  saveAndContinue: 'Save and continue',
};

class RespondTypePage {
  enterResponseToClaim(claimRef, responseType){
    I.amOnPage('/case/'+claimRef+'/response/response-type');
    I.see('How do you respond to the claim?', 'h1');
    switch (responseType){
      case 'full-admission':{
        I.click(fields.responseAdmitAll);
        break;
      }
      case 'partial-admission':{
        I.click(fields.responsePartAdmit);
        break;
      }
      case 'rejectAll':{
        I.click(fields.responseRejectAll);
        break;
      }
      default:{
        I.click(fields.responseAdmitAll);
        break;
      }
    }
    I.click(buttons.saveAndContinue);
  }
}

module.exports = RespondTypePage;

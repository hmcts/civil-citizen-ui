import I = CodeceptJS.I

const I: I = actor();

const fields = {
  responseAdmitAll: 'input[id="responseType"]',
  responsePartAdmit: 'input[id="responseType-2"]',
  responseRejectAll: 'input[id="responseType-3"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

export class RespondTypePage {
  enterResponseToClaim(claimRef, responseType): void{
    I.amOnPage('/case/'+claimRef+'/response/response-type');
    I.see('How do you respond to the claim?', 'h1');
    switch (responseType){
      case 'admitAll':{
        I.click(fields.responseAdmitAll);
        break;
      }
      case 'partAdmit':{
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

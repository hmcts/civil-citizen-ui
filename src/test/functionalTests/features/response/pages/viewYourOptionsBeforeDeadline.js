const I = actor();

const fields ={
  yesIWantMoretime: 'input[id="option"]',
  iHaveAlreadyAgreedMoretime: 'input[id="option-2"]',
  requestRefused: 'input[id="option-3"]',
  dontWantMoreTime: 'input[id="option-4"]',
};
const buttons = {
  continue: 'a.govuk-button',
  saveAndContinue:'button.govuk-button',
};

class ViewYourOptionsBeforeDeadline {

  selectYouOptions(claimRef, deadlineOption) {
    I.amOnPage('/case/'+claimRef+'/response/understanding-your-options');
    I.see('Requesting extra time','h1');
    I.see('How much extra time can you request?','h3');
    I.click(buttons.continue);
    I.see('Response deadline');
    I.see('Current response deadline:');
    I.see('Do you want to request more time to respond?');
    switch(deadlineOption){
      case 'yesIWantMoretime':{
        I.click(fields.yesIWantMoretime);
        break;
      }
      case 'iHaveAlreadyAgreedMoretime':{
        I.click(fields.iHaveAlreadyAgreedMoretime);
        break;
      }
      case 'requestRefused':{
        I.click(fields.requestRefused);
        break;
      }
      case 'dontWantMoreTime':{
        I.click(fields.dontWantMoreTime);
        break;
      }
      default:
        I.click(fields.dontWantMoreTime);
    }
    I.click(buttons.saveAndContinue);
  }
}
module.exports = ViewYourOptionsBeforeDeadline;
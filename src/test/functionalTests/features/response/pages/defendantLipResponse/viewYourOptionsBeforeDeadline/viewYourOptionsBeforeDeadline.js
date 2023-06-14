const I = actor();

const fields ={
  yesIWantMoretime: 'input[id="option"]',
  iHaveAlreadyAgreedMoretime: 'input[id="option-2"]',
  requestRefused: 'input[id="option-3"]',
  dontWantMoreTime: 'input[id="option-4"]',
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};
const buttons = {
  continue: 'Continue',
  saveAndContinue: 'Save and continue',
};

var targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 40);
const extendedDay = targetDate.getDate();
const extendedMonth = targetDate.getMonth()+ 1;
const extendedYear = targetDate.getFullYear();

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
        I.click('Save and continue');
        I.see('You have already agreed to more time to respond','h1');
        I.see('Enter the respond date you have agreed with Test Inc\'s legal representative');
        I.fillField(fields.day, extendedDay );
        I.fillField(fields.month, extendedMonth);
        I.fillField(fields.year, extendedYear);
        I.click('Save and continue');
        I.see('New response deadline','h1');
        I.click('Continue');
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

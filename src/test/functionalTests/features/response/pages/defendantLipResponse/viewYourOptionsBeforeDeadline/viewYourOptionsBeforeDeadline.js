const I = actor();
const config = require('../../../../../../config');

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
  continue: 'a.govuk-button',
  saveAndContinue:'button.govuk-button',
};

var targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 40);
const extendedDay = targetDate.getDate();
const extendedMonth = targetDate.getMonth()+ 1;
const extendedYear = targetDate.getFullYear();
const extendedMonthPastError = targetDate.getMonth()- 1 ;
const extendedMonthFutureError = targetDate.getMonth() + 2 ;

class ViewYourOptionsBeforeDeadline {

  async selectYouOptions(claimRef, deadlineOption) {
    await I.amOnPage('/case/'+claimRef+'/response/understanding-your-options');
    await I.waitForText('Requesting extra time',config.WaitForText);
    await I.see('How much extra time can you request?','h3');
    await I.click(buttons.continue);
    await I.see('Response deadline');
    await I.see('Current response deadline:');
    await I.see('Do you want to request more time to respond?');
    switch(deadlineOption){
      case 'yesIWantMoretime':{
        await I.click(fields.yesIWantMoretime);
        break;
      }
      case 'iHaveAlreadyAgreedMoretime':{
        await I.click(fields.iHaveAlreadyAgreedMoretime);
        await I.click('Save and continue');
        await I.see('You have already agreed to more time to respond','h1');
        await I.see('Enter the respond date you have agreed with Test Inc\'s legal representative');
        await I.fillField(fields.day, extendedDay );
        await I.fillField(fields.month, extendedMonth);
        await I.fillField(fields.year, extendedYear);
        await I.click('Save and continue');
        await I.see('New response deadline','h1');
        await I.click('Continue');
        break;
      }
      case 'requestRefused':{
        await I.click(fields.requestRefused);
        break;
      }
      case 'dontWantMoreTime':{
        await I.click(fields.dontWantMoreTime);
        break;
      }
      default:
        await I.click(fields.dontWantMoreTime);
    }
    await I.click(buttons.saveAndContinue);
  }

  async selectYouOptionsError(claimRef, deadlineOption) {
    await I.amOnPage('/case/'+claimRef+'/response/understanding-your-options');
    await I.waitForText('Requesting extra time',config.WaitForText);
    await I.see('How much extra time can you request?','h3');
    await I.click(buttons.continue);
    await I.see('Response deadline');
    await I.see('Current response deadline:');
    await I.see('Do you want to request more time to respond?');
    await I.click(buttons.saveAndContinue);
    await I.see('There was a problem');
    await I.see('Select if you want to request more time, have already agreed more time, have had your request for more time refused, or you do not want more time');
    switch(deadlineOption){
      case 'yesIWantMoretime':{
        await I.click(fields.yesIWantMoretime);
        await I.click(buttons.saveAndContinue);
        await I.waitForText('Request more time to respond',config.WaitForText);
        await I.see('How much additional time are you asking for?');
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Select how much additional time you are asking for');
        break;
      }
      case 'iHaveAlreadyAgreedMoretime':{
        await I.click(fields.iHaveAlreadyAgreedMoretime);
        await I.click('Save and continue');
        await I.see('You have already agreed to more time to respond','h1');
        await I.see('Enter the respond date you have agreed with Test Inc\'s legal representative');
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Enter the agreed response date');
        await I.see('Enter a valid day');
        await I.see('Enter a valid month');
        await I.see('Enter a valid year');
        //past date
        await I.fillField(fields.day, extendedDay );
        await I.fillField(fields.month, extendedMonthPastError);
        await I.fillField(fields.year, extendedYear);
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Agreed response date must be in the future');
        //future date
        await I.fillField(fields.day, extendedDay );
        await I.fillField(fields.month, extendedMonthFutureError);
        await I.fillField(fields.year, extendedYear);
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Agreed response date cannot be more than 28 days after the original response date');
        break;
      }
    }
  }
}
module.exports = ViewYourOptionsBeforeDeadline;

const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

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
  saveAndContinue:'#main-content button.govuk-button',
};

const content = {
  heading1: {
    en: 'Requesting extra time',
    cy: 'Gwneud cais am ragor o amser',
  },
  subheading1: {
    en: 'How much extra time can you request?',
    cy: 'Faint o amser ychwanegol y gallwch wneud cais amdano?',
  },
  heading2: {
    en: 'Response deadline',
    cy: 'Terfyn amser ar gyfer ymateb',
  },
  subheading2: {
    en: 'Current response deadline:',
    cy: 'Terfyn amser cyfredol ar gyfer ymateb:',
  },
  moreTimeQuestion: {
    en: 'Do you want to request more time to respond?',
    cy: 'Ydych chi eisiau gwneud cais am ragor o amser i ymateb?',
  },
};

var targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 40);
const targetDay = targetDate.getDate();
const targetMonth = targetDate.getMonth() + 1;
const targetYear = targetDate.getFullYear();

var futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 60);
const futureDay = futureDate.getDate();
const futureMonth = futureDate.getMonth() + 1;
const futureYear = futureDate.getFullYear();

var pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 1);
const pastDay = pastDate.getDate();
const pastMonth = pastDate.getMonth() + 1;
const pastYear = pastDate.getFullYear();

class ViewYourOptionsBeforeDeadline {

  async selectYouOptions(claimRef, deadlineOption) {
    const { language } = sharedData;
    await I.amOnPage('/case/'+claimRef+'/response/understanding-your-options');
    await I.waitForContent(content.heading1[language],config.WaitForText);
    await I.see(content.subheading1[language],'h3');
    await I.click(buttons.continue);
    await I.see(content.heading2[language]);
    await I.see(content.subheading2[language]);
    await I.see(content.moreTimeQuestion[language]);
    switch(deadlineOption){
      case 'yesIWantMoretime':{
        await I.click(fields.yesIWantMoretime);
        break;
      }
      case 'iHaveAlreadyAgreedMoretime':{
        await I.click(fields.iHaveAlreadyAgreedMoretime);
        await I.click('Save and continue');
        await I.see('You have already agreed to more time to respond','h1');
        await I.see('Enter the respond date you have agreed with the other party or their legal representative');
        await I.fillField(fields.day, targetDay);
        await I.fillField(fields.month, targetMonth);
        await I.fillField(fields.year, targetYear);
        await I.click('Save and continue');
        await I.see('New response deadline','h1');
        await I.click('Continue');
        return;
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
    await I.waitForContent('Requesting extra time',config.WaitForText);
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
        await I.waitForContent('Request more time to respond',config.WaitForText);
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
        await I.see('Enter the respond date you have agreed with the other party or their legal representative');
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Enter the agreed response date');
        await I.see('Enter a valid day');
        await I.see('Enter a valid month');
        await I.see('Enter a valid year');
        //past date
        await I.fillField(fields.day, pastDay);
        await I.fillField(fields.month, pastMonth);
        await I.fillField(fields.year, pastYear);
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Agreed response date must be in the future');
        //future date
        await I.fillField(fields.day, futureDay);
        await I.fillField(fields.month, futureMonth);
        await I.fillField(fields.year, futureYear);
        await I.click(buttons.saveAndContinue);
        await I.see('There was a problem');
        await I.see('Agreed response date cannot be more than 28 days after the original response date');
        break;
      }
    }
  }
}
module.exports = ViewYourOptionsBeforeDeadline;

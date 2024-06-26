const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  disagreeOption4: 'input[id="disagreeMediationOption-4"]',
};

const content = {
  heading: {
    en: 'Free telephone mediation',
    cy: 'Gwasanaeth cyfryngu dros y ffôn am ddim',
  },
};

class FreeTelephoneMediation {

  async selectMediation(claimRef) {
    const { language } = sharedData; 
    await I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(cButtons.continue[language]);
  }

  async selectNoMediation(claimRef){
    await I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    await I.waitForContent('Free telephone mediation', config.WaitForText);
    await I.click('I do not agree to free mediation');
    await I.see('The claim will continue and you may have to go to a hearing.');
    await I.see('Advantages of free mediation');
    await I.see('There are many advantages to free mediation, including:');
    await I.see('You chose not to try free mediation');
    await I.click(fields.noButton);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/mediation/i-dont-want-free-mediation');
    await I.see('I do not agree to free mediation');
    await I.see('You have chosen not to try free mediation. Please tell us why:');
    await I.click(fields.disagreeOption4);
    await I.click('Save and continue');
  }
}

module.exports = FreeTelephoneMediation;

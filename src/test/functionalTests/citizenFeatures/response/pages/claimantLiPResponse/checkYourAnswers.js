const I = actor();
const config = require('../../../../../config');
const sharedData = require('../../../../sharedData');
const cButtons = require('../../../../commonComponents/cButtons');

const fields = {
  directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
};

const content = {
  heading: {
    en: 'Check your answers',
    cy: 'Gwiriwch eich atebion',
  },
  confirmationHeading: {
    en: 'You\'ve submitted your response',
    cy: 'Rydych wedi cyflwyno eich ymateb',
  },
  confirmationSubheading: {
    en: 'What happens next',
    cy: 'Beth sy\'n digwydd nesaf',
  },
};

class CheckYourAnswersPage {
  async verifyMediationDetailsInCYA(claimRef) {
    await I.click('Check and submit your response');
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      I.amOnPage('/case/'+claimRef+'/response/task-list');
      I.click('Check and submit your response');
    }
    I.waitForContent('Check your answers', config.WaitForText);
    I.see('Availability for mediation');
    I.see('Is Test Company the person who will be attending the mediation appointment?');
    I.see('Can the mediator use ');
    I.see('Can the mediation team use ');
    I.see('Are there any dates in the next 3 months when you cannot attend mediation?');
    I.see('Dates unavailable');
  }

  async verifyClaimantMediationDetailsInCYA(claimRef) {
    await I.click('Check and submit your response');
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      I.amOnPage('/case/'+claimRef+'/response/task-list');
      I.click('Check and submit your response');
    }
    I.waitForContent('Check your answers', config.WaitForText);
    I.see('Availability for mediation');
    I.see('Can the mediator use ');
    I.see('Can the mediation team use ');
    I.see('Are there any dates in the next 3 months when you cannot attend mediation?');
    I.see('Dates unavailable');
  }

  async verifyEditedEmailDetails() {
    const { language } = sharedData;
    I.click('Check and submit your response');
    I.waitForContent('Check your answers', config.WaitForText);
    I.see('test@gmail.com');
    I.click(cButtons.submit[language]);
    I.waitForContent('You\'ve rejected their response',config.WaitForText);
    await I.waitForContent(content.confirmationSubheading[language]);
  }

  async clickEmailChangeLink() {
    await I.click('a[href*="email-confirmation"]');
    await I.waitForContent('Can the mediation team use', config.WaitForText);
  }

  async submitClaimantResponse() {
    I.checkOption(fields.directionsQuestionnaireSigned);
    const { language } = sharedData;
    I.click(cButtons.submit[language]);
    I.waitForContent('You\'ve rejected their response',config.WaitForText);
    I.see(content.confirmationSubheading[language]);
  }

  async submitYourResponse() {
    I.click('Check and submit your response');
    const { language } = sharedData;
    I.click(cButtons.submit[language]);
    I.waitForContent('You\'ve rejected their response',config.WaitForText);
    I.see(content.confirmationSubheading[language]);
  }
}

module.exports = CheckYourAnswersPage;

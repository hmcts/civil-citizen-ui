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
      await I.amOnPage('/case/'+claimRef+'/response/task-list');
      await I.click('Check and submit your response');
    }
    await I.waitForContent('Check your answers', config.WaitForText);
    await I.see('Availability for mediation');
    await I.see('Is Test Company the person who will be attending the mediation appointment?');
    await I.see('Can the mediator use ');
    await I.see('Can the mediation team use ');
    await I.see('Are there any dates in the next 3 months when you cannot attend mediation?');
    await I.see('Dates unavailable');
  }

  async verifyClaimantMediationDetailsInCYA(claimRef) {
    await I.click('Check and submit your response');
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      await I.amOnPage('/case/'+claimRef+'/response/task-list');
      await I.click('Check and submit your response');
    }
    await I.waitForContent('Check your answers', config.WaitForText);
    await I.see('Availability for mediation');
    await I.see('Can the mediator use ');
    await I.see('Can the mediation team use ');
    await I.see('Are there any dates in the next 3 months when you cannot attend mediation?');
    await I.see('Dates unavailable');
  }

  async verifyEditedEmailDetails() {
    const { language } = sharedData;
    await I.click('Check and submit your response');
    await I.waitForContent('Check your answers', config.WaitForText);
    await I.see('test@gmail.com');
    await I.click(cButtons.submit[language]);
    await I.waitForContent('You\'ve rejected their response',config.WaitForText);
    await I.waitForContent(content.confirmationSubheading[language]);
  }

  async clickEmailChangeLink() {
    await I.click('a[href*="email-confirmation"]');
    await I.waitForContent('Can the mediation team use', config.WaitForText);
  }

  async submitClaimantResponse() {
    await I.checkOption(fields.directionsQuestionnaireSigned);
    const { language } = sharedData;
    await I.click(cButtons.submit[language]);
    await I.waitForContent('You\'ve rejected their response',config.WaitForText);
    await I.see(content.confirmationSubheading[language]);
  }

  async submitYourResponse() {
    await I.click('Check and submit your response');
    const { language } = sharedData;
    await I.click(cButtons.submit[language]);
    await I.waitForContent('You\'ve rejected their response',config.WaitForText);
    await I.see(content.confirmationSubheading[language]);
  }
}

module.exports = CheckYourAnswersPage;

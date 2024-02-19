const I = actor();
const config = require('../../../../../config');
const { sharedData } = require('../../../../sharedData');

const fields = {
  cyaSigned: 'input[id="signed"]',
  directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
  signedName: 'input[id="signerName"]',
  signedRole: 'input[id="signerRole"]',
};

const buttons = {
  submit: {
    en: 'Submit Response',
    cy: 'Cyflwyno\'r ymateb',
  },
};

const links = {
  checkAndSubmit: {
    en: 'Check and submit your response', 
    cy: 'Gwirio a chyflwyno eich ymateb',
  },
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
  async checkAndSubmit(claimRef, responseType='', claimType) {
    const {language} = sharedData; 
    await I.click(links.checkAndSubmit[language]);
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      await I.amOnPage('/case/'+claimRef+'/response/task-list');
      await I.click('Check and submit your response');
    }
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.waitForElement(fields.cyaSigned);
    await I.checkOption(fields.cyaSigned);
    if(claimType == 'FastTrack'){
      await I.fillField(fields.signedName, 'TestTest');
      await I.fillField(fields.signedRole, 'Test');
    }
    if (responseType == 'partial-admission' || responseType == 'rejectAll') {
      await I.waitForElement(fields.directionsQuestionnaireSigned);
      await I.checkOption(fields.directionsQuestionnaireSigned);
    } else if (responseType == 'admitPartTwo') {
    //WIP Progerss :Please do not remove this comment
    }

    await I.click(buttons.submit[language]);
    await I.amOnPage('/case/'+claimRef+'/response/confirmation');
    await I.waitForText(content.confirmationHeading[language],config.WaitForText);
    await I.see(content.confirmationSubheading[language]);
  }

  async verifyMediationDetailsInCYA(claimRef) {
    await I.click('Check and submit your response');
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      I.amOnPage('/case/'+claimRef+'/response/task-list');
      I.click('Check and submit your response');
    }
    I.waitForText('Check your answers', config.WaitForText);
    I.waitForElement(fields.cyaSigned);

    I.see('Availability for mediation');
    I.see('Is Test Company the person who will be attending the mediation appointment?');
    I.see('Can the mediator use 02088908876 to call you for your mediation appointment?');
    I.see('Can the mediation team use civilmoneyclaimsdemo@gmail.com ' +
        'to contact you about your mediation appointment?');
    I.see('Are there any dates in the next 3 months when you cannot attend mediation?');
    I.see('Dates unavailable');
  }

  async verifyEditedEmailDetails() {
    I.click('Check and submit your response');
    I.waitForText('Check your answers', config.WaitForText);
    I.waitForElement(fields.cyaSigned);
    I.see('test@gmail.com');
  }

  async fillStatementOfTruthAndSubmit() {
    I.waitForText('Check your answers', config.WaitForText);
    I.waitForElement(fields.cyaSigned);
    I.fillField(fields.signedName, 'TestTest');
    I.fillField(fields.signedRole, 'Test');
    I.waitForElement(fields.cyaSigned);
    I.checkOption(fields.cyaSigned);
    I.checkOption(fields.directionsQuestionnaireSigned);
    if (['preview', 'demo'  ].includes(config.runningEnv)) {
      I.click(buttons.submit);
      I.waitForText(content.confirmationHeading[language],config.WaitForText);
      I.see(content.confirmationSubheading[language]);
    }
  }

  async navigateToCheckYourAnswersPage(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/response/check-and-send');
  }

  async clickEmailChangeLink() {
    await I.click('a[href*="email-confirmation"]');
    await I.waitForText('Can the mediation team use', config.WaitForText);
  }
}

module.exports = CheckYourAnswersPage;

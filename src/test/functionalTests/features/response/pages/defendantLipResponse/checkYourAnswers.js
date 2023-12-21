const I = actor();
const config = require('../../../../../config');

const fields = {
  cyaSigned: 'input[id="signed"]',
  directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
  signedName: 'input[id="signerName"]',
  signedRole: 'input[id="signerRole"]',
};

const buttons = {
  submit: 'Submit Response',
};

class CheckYourAnswersPage {
  async checkAndSubmit(claimRef, responseType='', claimType) {
    await I.click('Check and submit your response');
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      await I.amOnPage('/case/'+claimRef+'/response/task-list');
      await I.click('Check and submit your response');
    }
    await I.waitForText('Check your answers', config.WaitForText);
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

    //Added the below IF statement to exclude these steps in AAT as we are ignoring cui non prod files in AAT
    //Once the CUI Release is done, we can remove this IF statement.

    if (['preview', 'demo'  ].includes(config.runningEnv)) {
      await I.click(buttons.submit);
      await I.amOnPage('/case/'+claimRef+'/response/confirmation');
      await I.waitForText('You\'ve submitted your response',config.WaitForText);
      await I.see('What happens next');
    }
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

  async fillStatementOfTruthAndSubmit(claimRef) {
    I.waitForText('Check your answers', config.WaitForText);
    I.waitForElement(fields.cyaSigned);
    I.fillField(fields.signedName, 'TestTest');
    I.fillField(fields.signedRole, 'Test');
    I.waitForElement(fields.cyaSigned);
    I.checkOption(fields.cyaSigned);
    I.checkOption(fields.cyaSigned);
    if (['preview', 'demo'  ].includes(config.runningEnv)) {
      I.click(buttons.submit);
      I.amOnPage('/case/'+claimRef+'/response/confirmation');
      I.waitForText('You\'ve submitted your response',config.WaitForText);
      I.see('What happens next');
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

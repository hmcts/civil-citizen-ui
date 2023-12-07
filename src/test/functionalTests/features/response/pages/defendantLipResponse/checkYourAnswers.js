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

  async navigateToCheckYourAnswersPage(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/response/check-and-send');
  }
}

module.exports = CheckYourAnswersPage;

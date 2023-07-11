const I = actor();
const config = require('../../../../../config');

const fields = {
  cyaSigned: 'input[id="signed"]',
  directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
};

const buttons = {
  submit: 'Submit Response',
};

class CheckYourAnswersPage {
  async checkAndSubmit(claimRef, responseType='') {
    await I.click('Check and submit your response');
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if(url.includes('pcq')){
      // if(I.see('Equality and diversity questions')){
      //   await I.click('I don\'t want to answer these questions');
      // }else if(I.see('Sorry, there is a problem with the service')){
      //   await I.click('Continue');
      // }
      await I.amOnPage('/case/'+claimRef+'/response/task-list');
      await I.click('Check and submit your response');
    }
    await I.see('Check your answers', 'h1');
    await I.waitForElement(fields.cyaSigned);
    await I.checkOption(fields.cyaSigned);
    if (responseType == 'partial-admission' || responseType == 'rejectAll') {
      await I.waitForElement(fields.directionsQuestionnaireSigned);
      await I.checkOption(fields.directionsQuestionnaireSigned);
    } else if (responseType == 'admitPartTwo') {
    //WIP Progerss :Please do not remove this comment
    }

    //Added the below IF statement to exclude these steps in AAT as we are ignoring cui non prod files in AAT
    //Once the CUI Release is done, we can remove this IF statement.

    if((config.TestUrl).includes('preview')  ){
      await I.click(buttons.submit);
      await I.amOnPage('/case/'+claimRef+'/response/confirmation');
      await I.see('You\'ve submitted your response','h1');
      await I.see('What happens next');
    }
  }

  async navigateToCheckYourAnswersPage(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/response/check-and-send');
  }
}

module.exports = CheckYourAnswersPage;

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
  checkAndSubmit(claimRef, responseType='') {
    I.click('Check and submit your response');
    I.see('Check your answers', 'h1');
    I.waitForElement(fields.cyaSigned);
    I.checkOption(fields.cyaSigned);
    if (responseType == 'partAdmit') {
      I.waitForElement(fields.directionsQuestionnaireSigned);
      I.checkOption(fields.directionsQuestionnaireSigned);
    } else if (responseType == 'admitPartTwo') {
    //WIP Progerss :Please do not remove this comment
    }

    //Added the below IF statement to exclude these steps in AAT as we are ignoring cui non prod files in AAT
    //Once the CUI Release is done, we can remove this IF statement.

    if((config.TestUrl).includes('preview')  ){
      I.click(buttons.submit);
      I.amOnPage('/case/'+claimRef+'/response/confirmation');
      I.see('You\'ve submitted your response','h1');
      I.see('What happens next');
    }
  }

  navigateToCheckYourAnswersPage(claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/check-and-send');
  }
}

module.exports = CheckYourAnswersPage;

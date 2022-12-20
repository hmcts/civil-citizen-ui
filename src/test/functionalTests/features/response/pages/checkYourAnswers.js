const I = actor();

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
    I.click(buttons.submit);
    I.amOnPage('/case/'+claimRef+'/response/confirmation');
    I.see('You\'ve submitted your response','h1');
    I.see('What happens next');
  }

  navigateToCheckYourAnswersPage(claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/check-and-send');
  }
}

module.exports = CheckYourAnswersPage;

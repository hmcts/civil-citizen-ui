const I = actor();

const fields = {
  cyaSigned: 'input[id="signed"]',
};

const buttons = {
  submit: 'Submit Response',
};

class CheckYourAnswersPage {
  checkAndSubmit(claimRef) {
    console.log('The value of the claimref Inside Check Ur answers Page ' + claimRef);    
    I.click('Check and submit your response');
    I.see('Check your answers', 'h1');
    I.waitForElement(fields.cyaSigned); 
    I.checkOption(fields.cyaSigned);     
    I.checkOption(fields.cyaSigned);  
    I.click(buttons.submit);
    I.see('You\'ve submitted your response','h1');    
  }
   
  navigateToCheckYourAnswersPage(claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/check-and-send');
  }
}

module.exports = CheckYourAnswersPage;

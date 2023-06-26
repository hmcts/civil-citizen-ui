
const I = actor();

const fields = {
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  disagreeOption4: 'input[id="disagreeMediationOption-4"]',
};

class FreeTelephoneMediation {

  async selectMediation(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    await I.see('Free telephone mediation', 'h1');
    await I.click('Continue');
  }
  selectNoMediation(claimRef){
    I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    I.see('Free telephone mediation', 'h1');
    I.click('I do not agree to free mediation');
    I.see('The claim will continue and you may have to go to a hearing.');
    I.see('Advantages of free mediation');
    I.see('There are many advantages to free mediation, including:');
    I.see('You chose not to try free mediation');
    I.click(fields.noButton);
    I.click('Save and continue');
    I.seeInCurrentUrl('/mediation/i-dont-want-free-mediation');
    I.see('I do not agree to free mediation');
    I.see('You have chosen not to try free mediation. Please tell us why:');
    I.click(fields.disagreeOption4);
    I.click('Save and continue');
  }
}

module.exports = FreeTelephoneMediation;


const I = actor();

class FreeTelephoneMediation {

  selectEvidenceFromDropDown(claimRef) {    
    I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    I.see('Free telephone mediation', 'h1');
    I.click('Continue');
  }
}

module.exports = FreeTelephoneMediation;
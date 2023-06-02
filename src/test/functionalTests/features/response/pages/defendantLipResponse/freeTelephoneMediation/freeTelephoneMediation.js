
const I = actor();

const fields ={
  mediation_disagreement: '[href=\'./mediation-disagreement\']'
};

class FreeTelephoneMediation {

  selectMediation(claimRef) {
    I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    I.see('Free telephone mediation', 'h1');
    I.click('Continue');
  }

  skipMediation(claimRef) {
    I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    I.see('Free telephone mediation', 'h1');
    I.click(fields.mediation_disagreement);
  }

}

module.exports = FreeTelephoneMediation;

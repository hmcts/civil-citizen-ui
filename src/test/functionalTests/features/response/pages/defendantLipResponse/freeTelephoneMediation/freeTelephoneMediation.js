
const I = actor();

class FreeTelephoneMediation {

  async selectMediation(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    await I.see('Free telephone mediation', 'h1');
    await I.click('Continue');
  }
}

module.exports = FreeTelephoneMediation;

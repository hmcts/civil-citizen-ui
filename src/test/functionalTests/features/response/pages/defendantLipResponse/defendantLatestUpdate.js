const I = actor();

class DefendantLatestUpdate {

  open(claimRef) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyDefendantUpdatePageContent();
    I.click('Respond to claim');
  }

  verifyDefendantUpdatePageContent() {
    I.see('You haven\'t responded to this claim');
    I.see('Claim number: ');
    I.see('You need to respond before');
    I.see('(28 Days remaining)');
    I.see('About claim');
    I.see('Claimant name:');
    I.see('Claim amount');
    I.see('Claim details:');
  }
}

module.exports = DefendantLatestUpdate;

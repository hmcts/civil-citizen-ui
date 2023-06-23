const I = actor();

class DefendantLatestUpdate {

  async open(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await this.verifyDefendantUpdatePageContent();
    await I.click('Respond to claim');
  }

  async openSummaryPage(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await I.see('More time requested');
  }

  async verifyDefendantUpdatePageContent() {
    await I.waitForText('You haven\'t responded to this claim');
    await I.see('Claim number: ');
    await I.see('You need to respond before');
    await I.see('(28 Days remaining)');
    await I.see('About claim');
    await I.see('Claimant name:');
    await I.see('Claim amount');
    await I.see('Claim details:');
  }
}

module.exports = DefendantLatestUpdate;

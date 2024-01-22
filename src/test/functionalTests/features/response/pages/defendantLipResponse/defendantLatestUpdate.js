const I = actor();
const config = require('../../../../../config');

class DefendantLatestUpdate {

  async open(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/response/task-list');
    // await this.verifyDefendantUpdatePageContent();
    // await I.click('Respond to claim');
  }

  async openSummaryPage(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await I.waitForText('More time requested', config.WaitForText);
  }

  async verifyDefendantUpdatePageContent() {
    await I.waitForText('You haven\'t responded to this claim', config.WaitForText);
    await I.see('Claim number: ');
    await I.see('You need to respond before');
    //exact days to be updated based on logic
    await I.see('Days remaining');
    await I.see('About claim');
    await I.see('Claimant name:');
    await I.see('Claim amount');
    await I.see('Claim details:');
  }
}

module.exports = DefendantLatestUpdate;

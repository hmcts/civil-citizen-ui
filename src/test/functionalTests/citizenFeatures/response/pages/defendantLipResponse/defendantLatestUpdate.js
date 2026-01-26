const I = actor();
const config = require('../../../../../config');
const { verifyNotificationTitleAndContent } = require('../../../../specClaimHelpers/e2e/dashboardHelper');
const { respondToClaim } = require('../../../../specClaimHelpers/dashboardNotificationConstants');

class DefendantLatestUpdate {

  async open(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    const notification = await respondToClaim();
    await verifyNotificationTitleAndContent('', notification.title, notification.content);
    await I.click(notification.nextSteps);
  }

  async openSummaryPage(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await I.waitForContent('More time requested', config.WaitForText);
  }

  async verifyDefendantUpdatePageContent() {
    await I.waitForContent('You haven\'t responded to this claim', config.WaitForText);
    await I.see('Claim number: ');
    await I.see('You need to respond before');
    //exact days to be updated based on logic
    await I.see('ays remaining');
    await I.see('About claim');
    await I.see('Claimant name:');
    await I.see('Claim amount');
    await I.see('Claim details:');
  }

  async openSSAPage(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/settlement-agreement/sign-settlement-agreement');
    await I.waitForContent('Respond to the settlement agreement', config.WaitForText);
  }
}

module.exports = DefendantLatestUpdate;

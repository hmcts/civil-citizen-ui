const I = actor();
const config = require('../../../../../config');

const testingSupport = require('../../../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../../../specClaimHelpers/e2e/dashboardHelper');
const { respondToClaim } = require('../../../../specClaimHelpers/dashboardNotificationConstants');

class DefendantLatestUpdate {

  async open(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    const isDashboardServiceEnabled = await testingSupport.isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      const notification = await respondToClaim();
      await verifyNotificationTitleAndContent('', notification.title, notification.content);
      await I.click(notification.nextSteps);
    } else {
      await this.verifyDefendantUpdatePageContent();
      await I.click('Respond to claim');
    }
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
    await I.see('Days remaining');
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

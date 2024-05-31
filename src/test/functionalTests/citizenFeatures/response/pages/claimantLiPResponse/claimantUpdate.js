const I = actor();
const config = require('../../../../../config');

const { isDashboardServiceToggleEnabled } = require('../../../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent} = require('../../../../specClaimHelpers/e2e/dashboardHelper');

class ClaimantUpdate {
  async respondToClaim(claimRef, notification) {
    console.log('notification..', notification);
    I.amOnPage('/dashboard/' + claimRef + '/claimant');
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      await verifyNotificationTitleAndContent('', notification.title, notification.content);
      I.click(notification.nextSteps);
    } else {
      I.waitForContent('About claim', config.WaitForText);
      I.click('Respond to claim');
    }
  }

  async startUploadDocs() {
    I.click('Upload mediation documents');
    I.waitForContent('Upload your documents', config.WaitForText);
    I.see('Deadlines for uploading documents');
    I.click('Start now');
  }

  async viewMediationDocs() {
    I.click('View mediation documents');
    I.waitForContent('View mediation documents', config.WaitForText);
    I.see('Claim amount:');
    I.see('Claimant mediation documents');
    I.see('TestPDF.pdf');
  }

  async clickAndViewDocs() {
    I.click('View documents');
    I.waitForContent('View mediation documents', config.WaitForText);
    I.see('Claim amount:');
    I.see('Claimant mediation documents');
    I.see('Defendant mediation documents');
    I.see('TestPDF.pdf');
  }
}

module.exports = ClaimantUpdate;

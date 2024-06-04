const I = actor();
const config = require('../../../../../config');

const { isDashboardServiceToggleEnabled } = require('../../../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../../../specClaimHelpers/e2e/dashboardHelper');

class ClaimantUpdate {
  async respondToClaim(claimRef, notification) {
    console.log('notification..', notification);
    I.amOnPage('/dashboard/' + claimRef + '/claimant');
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      await verifyNotificationTitleAndContent('', notification.title, notification.content);
      await I.click(notification.nextSteps);
    } else {
      I.waitForContent('About claim', config.WaitForText);
      I.click('Respond to claim');
    }
  }

  async startUploadDocs(claimRef) {
    I.amOnPage('/case/' + claimRef + '/mediation/start-upload-documents');
    let url = await I.grabCurrentUrl();
    //Check if dashboard page appears
    if(url.includes('dashboard')){
      I.amOnPage('/case/' + claimRef + '/mediation/start-upload-documents');
    }
    I.waitForContent('Upload your documents', config.WaitForText);
    I.see('Deadlines for uploading documents');
    I.click('Start now');
  }
}

module.exports = ClaimantUpdate;

const I = actor();
const config = require('../../../../../config');
const { verifyNotificationTitleAndContent} = require('../../../../specClaimHelpers/e2e/dashboardHelper');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
};

class ClaimantUpdate {
  async respondToClaim(claimRef, notification) {
    console.log('notification..', notification);
    await I.amOnPage('/dashboard/' + claimRef + '/claimant');
    await verifyNotificationTitleAndContent('', notification.title, notification.content);
    await I.click(notification.nextSteps);
  }

  async viewAndRespondToClaim(claimRef, notification) {
    console.log('notification..', notification);
    await I.amOnPage('/dashboard/' + claimRef + '/claimant');
    await verifyNotificationTitleAndContent('', notification.title, notification.content);
    await I.click(notification.nextSteps);
  } 
  
  async startUploadDocs() {
    await I.waitForVisible(selectors.titleClass, config.WaitForText);
    await I.waitForVisible(selectors.contentClass, config.WaitForText);
    await I.click('Upload mediation documents');
    await I.waitForContent('Upload your documents', config.WaitForText);
    await I.see('Deadlines for uploading documents');
    await I.click('Start now');
  }

  async viewMediationDocs() {
    await I.waitForVisible(selectors.titleClass, config.WaitForText);
    await I.waitForVisible(selectors.contentClass, config.WaitForText);
    await I.click('View mediation documents');
    await I.waitForContent('View mediation documents', config.WaitForText);
    await I.see('Claim amount:');
    await I.see('Claimant mediation documents');
    await I.see('TestPDF.pdf');
  }

  async clickAndViewDocs() {
    await I.waitForContent('Documents uploaded', config.WaitForText);
    await I.click('View documents');
    await I.waitForContent('View mediation documents', config.WaitForText);
    await I.see('Claim amount:');
    await I.see('Claimant mediation documents');
    await I.see('Defendant mediation documents');
    await I.see('TestPDF.pdf');
  }
}

module.exports = ClaimantUpdate;

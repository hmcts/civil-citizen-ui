const I = actor();
const config = require('../../../../../config');
const cuiCookies = require('../../../../specClaimHelpers/fixtures/cookies/cuiCookies');
const idamCookies = require('../../../../specClaimHelpers/fixtures/cookies/idamCookies');

const fields = {
  claimNumber: 'input[id="claimReferenceValue"]',
  securityCode: 'input[id="pin"]',
};

const cookieButtons = {
  accept: 'button[id="cookie-accept-submit"]',
  hideMessage: 'button[name="hide-accepted"]',
};

class AssignCasePinInPost {

  async dismissCookieBannerIfPresent() {
    const acceptVisible = await I.grabNumberOfVisibleElements(cookieButtons.accept);
    if (acceptVisible > 0) {
      await I.click(cookieButtons.accept);
      const hideVisible = await I.grabNumberOfVisibleElements(cookieButtons.hideMessage);
      if (hideVisible > 0) {
        await I.click(cookieButtons.hideMessage);
      }
    }
  }

  async open(claimNumber, securityCode, manualPIP) {
    const isPlaywrightActive = await I.isPlaywright();
    if (isPlaywrightActive) {
      await I.clearCookie();
      await I.setCookie([...idamCookies, ...cuiCookies]);
    }
    await I.amOnPage('/first-contact/claim-reference/');
    await this.dismissCookieBannerIfPresent();
    await I.waitForContent('Enter your claim number', config.WaitForText);
    await I.fillField(fields.claimNumber, claimNumber);
    await I.click('Save and continue');
    if (manualPIP) {
      await I.waitForContent('Enter security code', config.WaitForText);
      await I.see('You can find it on the email or letter we sent you.');
      await I.fillField(fields.securityCode, securityCode);
      await I.click('Save and continue');
      await I.waitInUrl('first-contact/claim-summary', config.WaitForText);
      await this.dismissCookieBannerIfPresent();
      await this.verifyClaimSummaryPageContent(claimNumber);
      await I.click('Respond to claim');
      await this.waitForAssignClaimOrLoginRedirect();
    }
  }

  async waitForAssignClaimOrLoginRedirect() {
    const maxAttempts = 30;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const url = await I.grabCurrentUrl();
      if (url.includes('idam') || url.includes('/login') || url.includes('/assignclaim') || url.includes('/dashboard')) {
        await I.wait(5);
        return;
      }
      await I.wait(2);
    }
    throw new Error('Timed out waiting for login or dashboard redirect after Respond to claim');
  }

  async verifyClaimSummaryPageContent(claimNumber) {
    await I.seeInCurrentUrl('first-contact/claim-summary');
    await I.waitForContent('Claim details', config.WaitForText);
    await I.waitForContent('Claim number', config.WaitForText);
    await I.see(claimNumber);
    await I.see('Claim amount');
    await I.see('View amount breakdown');
    await I.see('Reason for claim:');
    await I.see('Timeline');
    await I.see('We have sent you the claim form by post. To view the claim form online or to download a copy, sign in to your account.');
    await I.see('How we use and store your personal information');
  }
}

module.exports = AssignCasePinInPost;

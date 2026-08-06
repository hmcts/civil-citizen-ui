const I = actor();
const config = require('../../../../../config');

const fields = {
  claimNumber: 'input[id="claimReferenceValue"]',
  securityCode: 'input[id="pin"]',
};

class AssignCasePinInPost {

  async open(claimNumber, securityCode, manualPIP) {
    await I.amOnPage('/first-contact/claim-reference/');
    await I.waitForContent('Enter your claim number', config.WaitForText);
    await I.fillField(fields.claimNumber, claimNumber);
    await I.click('Save and continue');
    if (manualPIP) {
      await I.see('Enter security code');
      await I.see('You can find it on the email or letter we sent you.');
      await I.fillField(fields.securityCode, securityCode);
      await I.click('Save and continue');
      await this.verifyClaimSummaryPageContent(claimNumber);
      await I.click('Respond to claim');
      // To let defendant role gets assigned to citizen without any issues and then login to see the claim on dashboard if requried
      await I.wait(10);
    }
  }

  async verifyClaimSummaryPageContent(claimNumber) {
    await I.seeInCurrentUrl('first-contact/claim-summary');
    await I.waitForContent('Claim details', config.WaitForText);
    await I.see('Claim number');
    await I.see(claimNumber);
    await I.see('Claim amount');
    await I.see('View amount breakdown');
    await I.see('Reason for claim:');
    await I.see('Timeline');
    await I.see('We have sent you the claim form by post. To view the claim form online or to download a copy, sign in to your account.');
    await I.see('How we use and store your personal information');
  }

  async enterClaimNumber(claimNumber) {
    await I.amOnPage('/first-contact/claim-reference/');
    await I.waitForContent(
      'Enter your claim number',
      config.WaitForText,
    );

    await I.fillField(fields.claimNumber, claimNumber);
    await I.click('Save and continue');

    const maxWaitSeconds = Number(config.WaitForText) || 60;

    for (let second = 0; second < maxWaitSeconds; second++) {
      const currentUrl = await I.grabCurrentUrl();

      if (currentUrl.includes('hmcts-access')) {
        console.log(
          'Claim-linking journey: HMCTS Access login before security code',
        );
        return true;
      }

      const securityCodeVisible =
        await I.grabNumberOfVisibleElements(fields.securityCode);

      if (securityCodeVisible > 0) {
        console.log(
          'Claim-linking journey: Security code before login',
        );
        return false;
      }

      await I.wait(1);
    }

    throw new Error(
      'Claim-linking journey did not reach HMCTS Access or the security-code page',
    );
  }

  async enterSecurityCodeAndContinue(claimNumber, securityCode) {
    await I.waitForContent(
      'Enter security code',
      config.WaitForText,
    );

    await I.see(
      'You can find it on the email or letter we sent you.',
    );

    await I.fillField(fields.securityCode, securityCode);
    await I.click('Save and continue');

    await this.verifyClaimSummaryPageContent(claimNumber);
    await I.click('Respond to claim');

    // Allow the defendant role allocation to complete.
    await I.wait(10);
  }
}

module.exports = AssignCasePinInPost;

const I = actor();
const config = require('../../../../../config');

const fields = {
  claimNumber: 'input[id="claimReferenceValue"]',
  securityCode: 'input[id="pin"]',
};

class AssignCasePinInPost {

  async open(claimNumber, securityCode) {
    await I.amOnPage('/first-contact/claim-reference/');
    await I.click('Accept additional cookies');
    await I.click('Hide this message');
    await I.waitForText('Enter your claim number', config.WaitForText);
    await I.see('Enter the claim number from the email or letter we sent you.');
    await I.fillField(fields.claimNumber, claimNumber);
    await I.click('Save and continue');
    await I.see('Enter security code');
    await I.see('You can find it on the email or letter we sent you.');
    await I.fillField(fields.securityCode, securityCode);
    await I.click('Save and continue');
    await this.verifyClaimSummaryPageContent(claimNumber);
    await I.click('Respond to claim');
    // To let defendant role gets assigned to citizen without any issues and then login to see the claim on dashboard if requried
    await I.wait(10);
  }

  async verifyClaimSummaryPageContent(claimNumber) {
    await I.seeInCurrentUrl('first-contact/claim-summary');
    await I.waitForText('Claim details', config.WaitForText);
    await I.see('Claim number:');
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

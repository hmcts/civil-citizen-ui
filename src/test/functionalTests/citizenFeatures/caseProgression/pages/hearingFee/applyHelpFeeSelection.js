const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpFeeSelection {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber, 'p');
    await I.see('Claim amount: ' + claimAmount, 'p');
  }

  async verifyHeadingDetails() {
    await I.see('Hearing', 'span');
    await I.see('Pay hearing fee', 'h1');
  }

  async verifyPageText() {
    await I.see('If you\'re on a low income, have limited savings or are claiming benefits, you may able to get');
    await I.see('If you meet the criteria, you may get support to pay some or all of the fee.');
    await I.see('Do you want to apply for help with fees?', 'h3');
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = ApplyHelpFeeSelection;

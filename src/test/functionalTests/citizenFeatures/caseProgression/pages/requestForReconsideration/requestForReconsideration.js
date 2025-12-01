const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class RequestForReconsideration {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount, partyName) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText(partyName);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    I.see('Home', 'li');
    await I.see('Request to review order', 'li');
  }

  async verifyHeadingDetails() {
    I.see('Request to review order', 'span');
    await I.see('How and why do you want the order changed?', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText(partyName) {
    await I.see('You can continue without giving details if you prefer. If you enter details ' + partyName + ' will be able to see what you said and add their own comments.');
  }

  async addReasons(reason) {
    await I.fillField('.govuk-textarea', reason);
  }
}

module.exports = RequestForReconsideration;

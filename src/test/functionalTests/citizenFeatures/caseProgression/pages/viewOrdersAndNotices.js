const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewDocuments {

  async checkPageFullyLoaded() {
    await I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    I.see('Home', 'li');
    await I.see('View orders and notices', 'li');
  }

  async verifyHeadingDetails() {
    I.see('Orders and notices from the court', 'span');
    await I.see('View orders and notices', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText() {
    I.see('Claimant');
    await I.see('Defendant');
  }

  async checkRequestToReviewOrder(partyType, date) {
    const requestReviewOrderLocator = '//tr[@class=\'govuk-table__row\'][.//p[contains(text(), \'Request to review order\')]]';
    I.see('Request to review order', requestReviewOrderLocator);
    I.see ('Created ['+ date +']', requestReviewOrderLocator);
    I.see(partyType + '_request_for_reconsideration.pdf', requestReviewOrderLocator);
    await I.seeElement('//a[contains(@class, \'govuk-link\') and text()=\'' + partyType + '_request_for_reconsideration.pdf\']');
  }
}
module.exports = ViewDocuments;

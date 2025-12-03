const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class CommentsForReconsideration {

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
    await I.see('Add your comments', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText(partyName) {
    I.see('A review of an order has been requested by the other parties.');
    I.see('You can add your own comments below as part of the review.');
    I.see(partyName + ' will be able to see your comments.');
    await I.see('Any evidence included in your comments should be relevant to the case.');
  }

  async addComments(comments) {
    await I.fillField('.govuk-textarea', comments);
  }
}

module.exports = CommentsForReconsideration;

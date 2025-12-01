const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class CheckYourAnswers {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(reason, caseNumber, claimAmount, journey) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText(reason, journey);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails() {
    I.see('Request to review order', 'span');
    await I.see('Check your answers', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText(reason, journey) {
    if (journey === 'RequestForReconsideration') {
      I.see('How and why do you want the order changed?', '.govuk-summary-list__key');
    } else {
      I.see('Add your comments', '.govuk-summary-list__key');
    }
    await I.see(reason, '.govuk-summary-list__value');
  }
}

module.exports = CheckYourAnswers;

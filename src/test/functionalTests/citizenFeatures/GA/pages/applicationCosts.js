const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplicationCosts {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[contains(text(), \'Start now\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType, feeAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText(applicationType, feeAmount);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see('Make an application', 'h1');
    I.see(applicationType, 'h1');
  }

  async verifyPageText(applicationType, feeAmount) {
    switch(applicationType) {
      case 'Reconsider an order':
        I.see(`To apply to reconsider an order, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'More time to do what is required by a court order':
        I.see(`To apply to extend time, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Change a hearing date':
        I.see(`To apply to change a hearing date, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        I.see('If the hearing date is more than 14 days away from the date you make this application and you have agreed to this with the other party, you will not need to pay the fee. If you add another application you\'ll still have to pay the fee for this additional application.');
        I.see('If the hearing date is less than 14 days away or you have not agreed to it in advance with the other party, the fee above applies.');
        I.see('The court may not agree to change the hearing, even if both parties have agreed.');
        break;
      case 'Relief from a penalty you\'ve been given by the court':
        I.see(`To apply to ask for relief from a penalty, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
    }
    await I.see('This fee will need to be paid once you\'ve created the application. If you\'re eligible, you may be able to apply for help with fees.');
  }
}

module.exports = ApplicationCosts;

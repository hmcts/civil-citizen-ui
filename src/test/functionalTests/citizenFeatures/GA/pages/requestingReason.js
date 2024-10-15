const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class RequestingReason {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Why are you requesting this order?', 'h1');
  }

  async verifyPageText() {
    I.see('The information you enter on this page will be seen by the other parties.');
    //I.see('You should explain why you\'re not going to meet the original deadline. You\'ll have the option to upload documents to support your reasons on the next screen.');
    I.see('Enter your reasons for requesting this order', 'h1');
    await I.seeElement('//*[@id="text"]');
  }

  async fillTextBox(orderText) {
    await I.fillField('#text', orderText);
  }
}

module.exports = RequestingReason;

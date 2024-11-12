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
    await this.verifyPageText(applicationType);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Why are you requesting this order?', 'h1');
  }

  async verifyPageText(applicationType) {
    I.see('The information you enter on this page will be seen by the other parties.');
    switch(applicationType) {
      case 'Reconsider an order':
        I.see('You should explain why you want the order to be reconsidered. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'More time to do what is required by a court order':
        I.see('You should explain why you\'re not going to meet the original deadline. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Change a hearing date':
        I.see('You should explain why you want the hearing date to be changed. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Relief from a penalty you\'ve been given by the court':
        I.see('You should explain:');
        I.see('why you\'ve been unable to meet what was required of you by a rule or court order');
        I.see('the effect this has had on the case');
        I.see('any other relevant information you think the court should know');
        I.see('You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
    }
    I.see('Enter your reasons for requesting this order', 'h1');
    await I.seeElement('//*[@id="text"]');
  }

  async fillTextBox(orderText) {
    await I.fillField('#text', orderText);
  }
}

module.exports = RequestingReason;

const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class OrderJudge {

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
    I.see('What order do you want the judge to make?', 'h1');
  }

  async verifyPageText() {
    //I.see('A judge will consider your application and make an order. The order that a judge would usually make to give more time to do what\'s required by a court order is in the box below.');
    //I.see('You\'ll need to add information to the box, like what you\'re asking for more time to do and a new deadline.');
    //I.see('You can also alter any of the other text if you need to.');
    I.see('You\'ll be able to explain your reasons on the next screen.');
    //I.see('The contents of this box will be seen by the other parties.');
    I.see('Enter the order that you want the judge to make', 'h1');
    await I.seeElement('//*[@id="text"]');
  }

  async fillTextBox(orderText) {
    await I.fillField('#text', orderText);
  }
}

module.exports = OrderJudge;

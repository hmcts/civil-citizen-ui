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
    await this.verifyPageText(applicationType);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('What order do you want the judge to make?', 'h1');
  }

  async verifyPageText(applicationType) {
    switch(applicationType) {
      case 'Reconsider an order':
        I.see('A judge will consider your application and make an order');
        I.see('You should explain which order and which parts of it you\'d like to be reconsidered. You\'ll be able to explain your reasons on the next screen.');
        I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'More time to do what is required by a court order':
        I.see('A judge will consider your application and make an order. The order that a judge would usually make to give more time to do what\'s required by a court order is in the box below.');
        I.see('You\'ll need to add information to the box, like what you\'re asking for more time to do and a new deadline.');
        I.see('You can also alter any of the other text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Change a hearing date':
        I.see('A judge will consider your application and make an order. The order that a judge would usually make to change a hearing date is in the box below.');
        I.see('You\'ll need to add information to the box, like when your hearing is currently arranged for, after what date you\'d like to change it to and any dates to avoid.');
        I.see('You can also alter any of the other text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Relief from a penalty you\'ve been given by the court':
        I.see('A judge will consider your application and make an order');
        I.see('You should explain what penalty you\'re asking for relief from. For example, if you missed a deadline to provide documents to the court, or if the court made an order giving you a penalty.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The information you enter on this page will be seen by the other parties.');
        break;
    }
    I.see('Enter the order that you want the judge to make', 'h1');
    await I.seeElement('//*[@id="text"]');
  }

  async fillTextBox(orderText) {
    await I.fillField('#text', orderText);
  }
}

module.exports = OrderJudge;

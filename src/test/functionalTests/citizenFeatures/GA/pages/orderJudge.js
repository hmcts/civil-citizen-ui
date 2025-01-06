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
      case 'Set aside (remove) a judgment':
        I.see('A judge will consider your application to make an order. The order that a judge would usually make to set aside (remove) a judgment is in the box below.');
        I.see('You can add or alter any of the text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Reconsider an order':
        I.see('A judge will consider your application and make an order');
        I.see('You should explain which order and which parts of it you\'d like to be reconsidered. You\'ll be able to explain your reasons on the next screen.');
        I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Change a hearing date':
        I.see('A judge will consider your application and make an order. The order that a judge would usually make to change a hearing date is in the box below.');
        I.see('You\'ll need to add information to the box, like when your hearing is currently arranged for, after what date you\'d like to change it to and any dates to avoid.');
        I.see('You can also alter any of the other text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'More time to do what is required by a court order':
        I.see('A judge will consider your application and make an order. The order that a judge would usually make to give more time to do what\'s required by a court order is in the box below.');
        I.see('You\'ll need to add information to the box, like what you\'re asking for more time to do and a new deadline.');
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
      case 'Ask to make a change to your claim or defence that you\'ve submitted':
        I.see('A judge will consider your application and make an order. The order that a judge would usually make to allow you to change your claim or defence is in the box below.');
        I.see('You can:');
        I.see('explain which document you want to amend');
        I.see('upload a new version of this document with any amends underlined. We\'ll ask if you want to upload documents to support your application later on');
        I.see('You can also alter any of the other text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Court to make a summary judgment on a case':
        I.see('A judge will consider your application to make an order. The order that a judge would usually make for a summary judgment is in the box below.');
        I.see('You can add or alter any of the text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Court to strike out all or part of the other parties\' case without a trial':
        I.see('A judge will consider your application and make an order.');
        I.see('You should:');
        I.see('explain which document you want to be dismissed');
        I.see('mention the date that the document was submitted');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Court to pause a claim':
        I.see('A judge will consider your application and make an order. The order that a judge would usually make to pause a claim is in the box below.');
        I.see('You\'ll need to add information to the box, like when you\'d like the claim to be paused until.');
        I.see('You can also alter any of the other text if you need to.');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Court to impose a sanction on the other parties unless they do a specific action':
        I.see('A judge will consider your application and make an order.');
        I.see('You should:');
        I.see('explain the action you want the other parties to take and by which date they should do this action');
        I.see('explain that you\'d like the court to give an appropriate sanction to the other parties');
        I.see('You\'ll be able to explain your reasons on the next screen.');
        I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Court to make an order settling the claim by consent':
        I.see('A judge will consider your application and make an order.');
        I.see('You should:');
        I.see('explain that you and all the parties involved in the case should be settled');
        I.see('include the name of all the parties involved');
        I.see('explain the terms of settlement');
        I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Court to do something that\'s not on this list':
        I.see('A judge will consider your application and make an order.');
        I.see('You should explain what order you want the judge to make. You\'ll be able to explain your reasons on the next screen.');
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

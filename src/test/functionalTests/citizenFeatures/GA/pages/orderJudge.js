const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class OrderJudge {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(applicationType) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails(applicationType);
    await this.verifyPageText(applicationType);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('What order do you want the judge to make?', 'h1');
  }

  async verifyPageText(applicationType) {
    switch(applicationType) {
      case 'Set aside (remove) a judgment':
        await I.see('A judge will consider your application to make an order. The order that a judge would usually make to set aside (remove) a judgment is in the box below.');
        await I.see('You can add or alter any of the text if you need to.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Reconsider an order':
        await I.see('A judge will consider your application and make an order');
        await I.see('You should explain which order and which parts of it you\'d like to be reconsidered. You\'ll be able to explain your reasons on the next screen.');
        await I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Change a hearing date':
        await I.see('A judge will consider your application and make an order. The order that a judge would usually make to change a hearing date is in the box below.');
        await I.see('You\'ll need to add information to the box, like when your hearing is currently arranged for, after what date you\'d like to change it to and any dates to avoid.');
        await I.see('You can also alter any of the other text if you need to.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'More time to do what is required by a court order':
        await I.see('A judge will consider your application and make an order. The order that a judge would usually make to give more time to do what\'s required by a court order is in the box below.');
        await I.see('You\'ll need to add information to the box, like what you\'re asking for more time to do and a new deadline.');
        await I.see('You can also alter any of the other text if you need to.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Relief from a penalty you\'ve been given by the court':
        await I.see('A judge will consider your application and make an order');
        await I.see('You should explain what penalty you\'re asking for relief from. For example, if you missed a deadline to provide documents to the court, or if the court made an order giving you a penalty.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Ask to make a change to your claim or defence that you\'ve submitted':
        await I.see('A judge will consider your application and make an order. The order that a judge would usually make to allow you to change your claim or defence is in the box below.');
        await I.see('You can:');
        await I.see('explain which document you want to amend');
        await I.see('upload a new version of this document with any amends underlined. We\'ll ask if you want to upload documents to support your application later on');
        await I.see('You can also alter any of the other text if you need to.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Court to make a summary judgment on a case':
        await I.see('A judge will consider your application to make an order. The order that a judge would usually make for a summary judgment is in the box below.');
        await I.see('You can add or alter any of the text if you need to.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Court to strike out all or part of the other parties\' case without a trial':
        await I.see('A judge will consider your application and make an order.');
        await I.see('You should:');
        await I.see('explain which document you want to be dismissed');
        await I.see('mention the date that the document was submitted');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Court to pause a claim':
        await I.see('A judge will consider your application and make an order. The order that a judge would usually make to pause a claim is in the box below.');
        await I.see('You\'ll need to add information to the box, like when you\'d like the claim to be paused until.');
        await I.see('You can also alter any of the other text if you need to.');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The contents of this box will be seen by the other parties.');
        break;
      case 'Court to impose a sanction on the other parties unless they do a specific action':
        await I.see('A judge will consider your application and make an order.');
        await I.see('You should:');
        await I.see('explain the action you want the other parties to take and by which date they should do this action');
        await I.see('explain that you\'d like the court to give an appropriate sanction to the other parties');
        await I.see('You\'ll be able to explain your reasons on the next screen.');
        await I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Court to make an order settling the claim by consent':
        await I.see('A judge will consider your application and make an order.');
        await I.see('You should:');
        await I.see('explain that you and all the parties involved in the case should be settled');
        await I.see('include the name of all the parties involved');
        await I.see('explain the terms of settlement');
        await I.see('The information you enter on this page will be seen by the other parties.');
        break;
      case 'Court to do something that\'s not on this list':
        await I.see('A judge will consider your application and make an order.');
        await I.see('You should explain what order you want the judge to make. You\'ll be able to explain your reasons on the next screen.');
        await I.see('The information you enter on this page will be seen by the other parties.');
        break;
    }
    await I.see('Enter the order that you want the judge to make', 'h1');
    await I.seeElement('//*[@id="text"]');
  }

  async fillTextBox(orderText) {
    await I.fillField('#text', orderText);
  }
}

module.exports = OrderJudge;

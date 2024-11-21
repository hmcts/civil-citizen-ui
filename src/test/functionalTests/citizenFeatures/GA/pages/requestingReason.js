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
      case 'Set aside (remove) a judgment':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should:');
        I.see('explain why you believe the judgment should be set aside. For example, if you missed the deadline to respond to the original claim form, then you should explain why');
        I.see('if you don\'t believe you owe the money, or if you disagree with the claim made against you, explain why');
        I.see('You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Reconsider an order':
        I.see('You should explain why you want the order to be reconsidered. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Change a hearing date':
        I.see('You should explain why you want the hearing date to be changed. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'More time to do what is required by a court order':
        I.see('You should explain why you\'re not going to meet the original deadline. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Relief from a penalty you\'ve been given by the court':
        I.see('You should explain:');
        I.see('why you\'ve been unable to meet what was required of you by a rule or court order');
        I.see('the effect this has had on the case');
        I.see('any other relevant information you think the court should know');
        I.see('You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Make a change to your claim or defence that you\'ve submitted':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why the change is needed also. If necessary, why it was not included in the original documents. You\'ll have the option to upload a new version of the document on the next screen.');
        break;
      case 'Court to make a summary judgment on a case':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why you do not believe the other parties\' claim will succeed. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Court to strike out all or part of the other parties\' case without a trial':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why you want the documents to be dismissed. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Court to pause a claim':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why the claim should be paused until the date you gave on the previous screen. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Court to impose a sanction on the other parties unless they do a specific action':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why you want the other parties to take this action. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Court to make an order settling the claim by consent':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why you\'re requesting this order. You\'ll have the option to upload documents to support your reasons on the next screen.');
        break;
      case 'Court to do something that\'s not on this list':
        I.see('The information you enter on this page will be seen by the other parties.');
        I.see('You should explain why you\'re requesting this order. You\'ll have the option to upload documents to support your reasons on the next screen.');
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

const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplicationType {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyPageText();
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('Ask the court to change something on your case (make an application)', 'h1');
    I.see('Select application', 'h1');
  }

  async verifyPageText() {
    I.see('When you request a change to your case, or contact the court to take a specific action, this is known as making an \'application\' to the court for an order.');
    I.see('An application is not a new claim. It is a request for a judge to take an action on an existing claim.');
    I.see('Select the application you want and click continue.');
    I.see('If you need to make multiple applications, you\'ll have the option to add another application later on.');
    await I.see('All applications', 'h1');
  }

  async verifyOptions() {
    I.see('All applications', 'h1');
    I.see('Ask to set aside (cancel) a judgment');
    I.see('For example, if you do not believe a judgment should\'ve been made or you\'ve not had the opportunity to respond to a claim and you have a defence. This application is usually made by defendants.');
    I.see('Ask to vary a judgment');
    I.see('For example, if you want to request to pay a judgment amount in instalments or make a change to instalments you\'ve already agreed. This application is usually made by defendants. Your payment offer will be presented to the other parties who can accept or reject it. If you\'re a defendant selecting this application, you\'ll need to upload an N245 form.');
    I.see('Ask the court to reconsider an order');
    I.see('If an order has been made after an application or a hearing that you were not informed about. This is also known as an application to set aside or vary an order.');
    I.see('Ask to change a hearing date');
    I.see('This is also known as an application to adjourn a hearing.');
    I.see('Ask for more time to do what is required by a court order');
    I.see('For example, asking for the deadline for uploading documents before a trial or hearing to be extended. You\'ll need to provide a valid reason for not meeting the original deadline. This application can only be made before the original deadline has passed. This is also known as an application to extend time.');
    I.see('Instead of making an application, you can get written agreement from the other parties for more time to do what\'s required by the court. To do this, the time extension you request must be less than 28 days and should not affect a hearing date.');
    I.see('Ask for relief from a penalty you\'ve been given by the court');
    I.see('For example, if you have not uploaded documents by the deadline. You can only make this application after the penalty has been given. This is also known as an application for relief from sanctions.');
    await I.see('Other applications');
  }
}

module.exports = ApplicationType;

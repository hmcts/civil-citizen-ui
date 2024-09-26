const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class AgreementFromOtherParty {

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
    I.see('More time to do what is required by a court order', 'h1');
    I.see('Application from the other parties', 'h1');
  }

  async verifyPageText() {
    I.see('You\'ll need to pay a fee to make an application');
    I.see('The fee amount depends on whether the other parties have agreed to you making this application. The other parties are the other side or sides involved in your case.');
    I.see('Getting agreement', 'h5');
    I.see('Asking the other parties to agree is optional. If they\'ve agreed, you do not need to have proof of this.');
    I.see('If you\'re not able to contact the other parties, or you\'ve attempted to contact them but have not had a response, select \'No\'.');
    I.see('If the other parties have agreed', 'h5');
    I.see('The application fee will be reduced, unless this is an application to:');
    I.see('set aside (remove) a judgment', 'li');
    I.see('vary a judgment', 'li');
    I.see('reconsider an order', 'li');
    await I.see('There may also be no need for a hearing to make a decision on the application. You\'ll see the final application fee amount before you pay.');
  }

  async verifyOptions() {
    I.see('Have the other parties agreed to this application?', 'h1');
    I.see('If you\'ll be selecting multiple applications, this answer will apply to all of them.');
    I.see('Yes');
    await I.see('No');
  }
}

module.exports = AgreementFromOtherParty;

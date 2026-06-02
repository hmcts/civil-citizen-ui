const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class AgreementFromOtherParty {

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
    await this.verifyPageText();
    await this.verifyOptions();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('Agreement from the other parties', 'h1');
  }

  async verifyPageText() {
    await I.see('You\'ll need to pay a fee to make an application');
    await I.see('The fee amount depends on whether the other parties have agreed to you making this application. The other parties are the other side or sides involved in your case.');
    await I.see('Getting agreement', 'h2');
    await I.see('Asking the other parties to agree is optional. If they\'ve agreed, you do not need to have proof of this.');
    await I.see('If you\'re not able to contact the other parties, or you\'ve attempted to contact them but have not had a response, select \'No\'.');
    await I.see('If the other parties have agreed', 'h2');
    await I.see('The application fee will be reduced, unless this is an application to:');
    await I.see('set aside (remove) a judgment', 'li');
    await I.see('vary a judgment', 'li');
    await I.see('There may also be no need for a hearing to make a decision on the application. You\'ll see the final application fee amount before you pay.');
  }

  async verifyOptions() {
    await I.see('Have the other parties agreed to this application?', 'h1');
    await I.see('If you\'ll be selecting multiple applications, this answer will apply to all of them.');
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = AgreementFromOtherParty;

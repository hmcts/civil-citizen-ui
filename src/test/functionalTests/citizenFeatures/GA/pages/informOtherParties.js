const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class InformOtherParties {

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
    await I.see('Informing the other parties', 'h1');
  }

  async verifyPageText() {
    await I.see('The court will usually send the other parties a copy of your application to give them the opportunity to respond to it.');
    await I.see('In some circumstances a judge may make an order without sending your application to the other parties first.');
    await I.see('If you do not want the court to inform the other parties about this application', 'h1');
    await I.see('You must provide a reason which will be considered by a judge.');
    await I.see('If the judge orders that the other parties should be informed, you’ll be notified and you\'ll need to pay an additional fee. Your application may also be delayed.');
  }

  async verifyOptions() {
    await I.see('Should the court inform the other parties about this application?', 'h1');
    await I.see('If you’ll be selecting multiple applications, this answer will apply to all of them.');
    await I.see('Yes');
    await I.see('No');
  }

  async selectAndVerifyDontInformOption() {
    await I.waitForContent('Should the court inform the other parties about this application', 60);
    await I.click('No');
    await I.fillField('#reasonForCourtNotInformingOtherParties', 'Do not need to inform');
    await I.click('Continue');
  }

  async selectAndVerifyDoInformOption() {
    await I.waitForContent('Should the court inform the other parties about this application', 60);
    await I.click('Yes');
    await I.click('Continue');
  }
}

module.exports = InformOtherParties;

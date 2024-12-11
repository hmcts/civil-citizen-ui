const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class InformOtherParties {

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
    this.verifyPageText();
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Informing the other parties', 'h1');
  }

  async verifyPageText() {
    I.see('The court will usually send the other parties a copy of your application to give them the opportunity to respond to it.');
    I.see('In some circumstances a judge may make an order without sending your application to the other parties first.');
    I.see('If you do not want the court to inform the other parties about this application', 'h1');
    I.see('You must provide a reason which will be considered by a judge.');
    await I.see('If the judge orders that the other parties should be informed, you’ll be notified and you\'ll need to pay an additional fee. Your application may also be delayed.');
  }

  async verifyOptions() {
    I.see('Should the court inform the other parties about this application?', 'h1');
    I.see('If you’ll be selecting multiple applications, this answer will apply to all of them.');
    I.see('Yes');
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

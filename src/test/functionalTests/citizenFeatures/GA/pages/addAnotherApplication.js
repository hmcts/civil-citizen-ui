const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class AddAnotherApplication {

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
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    //I.see('More time to do what is required by a court order', 'span');
    I.see('Do you want to add another application?', 'h1');
  }

  async verifyOptions() {
    I.see('There’s no additional fee for making more than one application.');
    I.see('Yes');
    await I.see('No');
  }
}

module.exports = AddAnotherApplication;

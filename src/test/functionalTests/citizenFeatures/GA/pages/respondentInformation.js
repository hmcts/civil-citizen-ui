const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class RespondentInformation {

  async checkPageFullyLoaded () {
    await I.waitForText('Start now');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('Respond to an application', 'h1');
    I.see('Respond to a request for a change to the case', 'h1');
  }

  async verifyPageText() {
    I.see('The other parties have requested a change to the case. The \'other parties\' are the other side or sides involved in your claim.');
    I.see('They requested a change by making an application.');
    await I.see('Their application and your response will then be sent to a judge.');
  }
}

module.exports = RespondentInformation;

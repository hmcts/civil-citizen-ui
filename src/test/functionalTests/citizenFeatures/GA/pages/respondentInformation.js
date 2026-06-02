const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class RespondentInformation {

  async checkPageFullyLoaded () {
    await I.waitForText('Start now');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent() {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails() {
    await I.see('Respond to an application', 'h1');
    await I.see('Respond to a request for a change to the case', 'h1');
  }

  async verifyPageText() {
    await I.see('The other parties have requested a change to the case. The \'other parties\' are the other side or sides involved in your claim.');
    await I.see('They requested a change by making an application.');
    await I.see('Their application and your response will then be sent to a judge.');
  }
}

module.exports = RespondentInformation;

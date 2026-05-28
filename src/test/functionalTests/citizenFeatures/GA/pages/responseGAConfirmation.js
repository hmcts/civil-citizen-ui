const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class SubmitGAConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent() {
    await this.checkPageFullyLoaded();
    await this.verifyHeadingDetails();
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('You\'ve responded to the application', 'h1');
  }

  async verifyPageText() {
    await I.see('What happens next', 'h2');
    await I.see('A judge will consider the application and your response.');
    await I.see('As a judge usually requires a hearing before making a decision on an application, you\'ll likely receive a hearing notice with details about when the application hearing will take place.');
    await I.see('You\'ll receive a notification letting you know if an application hearing has been scheduled or if there are any other updates.');
    await I.see('You can review the application and your response under \'View all applications\' on the case dashboard.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
  }
}

module.exports = SubmitGAConfirmation;

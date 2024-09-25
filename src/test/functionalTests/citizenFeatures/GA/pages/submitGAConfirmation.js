const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class SubmitGAConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[@class=\'govuk-link\' and contains(text(), \'Close and return to case details\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Application created', 'h1');
    I.see('You need to pay the application fee to submit the application');
  }

  async verifyPageText() {
    I.see('What happens next', 'h3');
    I.see('Your application has been saved, but you need to pay the application fee of £119.');
    I.see('Until you pay the application fee, the application will not be sent to the other parties or considered by a judge.');
    I.see('You\'ll have the option to apply for help with fees once you\'ve clicked \'Pay application fee\'.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Pay application fee\')]\n');
  }
}

module.exports = SubmitGAConfirmation;

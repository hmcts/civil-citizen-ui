const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class PaymentConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
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

  async verifyAdditionalPaymentPageContent(){
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    await this.verifyPageTextForAdditionalPayment();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Your payment was', 'h1');
    I.see('successful', 'h1');
    I.see('Your payment reference number is');
  }

  async verifyPageText() {
    I.see('What happens next', 'h2');
    I.see('If you chosen to inform the other parties or agreed the application, they will have 5 working days to respond to your application. If you have a hearing in the next 10 days, your application will be treated urgently.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
  }

  async verifyPageTextForAdditionalPayment() {
    I.see('What happens next', 'h2');
    I.see('The other parties will have 5 working days to respond to your application. If you have a hearing in the next 10 days, your application will be treated urgently.');
    I.see('If necessary, all documents relating to this application, including any response from the court, will be translated. You will be notified when these are available.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
  }
}

module.exports = PaymentConfirmation;

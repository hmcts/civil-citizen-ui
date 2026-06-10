const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class PaymentConfirmation {

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

  async verifyAdditionalPaymentPageContent(){
    await this.checkPageFullyLoaded();
    await this.verifyHeadingDetails();
    await this.verifyPageTextForAdditionalPayment();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Your payment was', 'h1');
    await I.see('successful', 'h1');
    await I.see('Your payment reference number is');
  }

  async verifyPageText() {
    await I.see('What happens next', 'h2');
    await I.see('If you chosen to inform the other parties or agreed the application, they will have 5 working days to respond to your application. If you have a hearing in the next 10 days, your application will be treated urgently.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
  }

  async verifyPageTextForAdditionalPayment() {
    await I.see('What happens next', 'h2');
    await I.see('The other parties will have 5 working days to respond to your application. If you have a hearing in the next 10 days, your application will be treated urgently.');
    await I.see('If necessary, all documents relating to this application, including any response from the court, will be translated. You will be notified when these are available.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Close and return to dashboard\')]\n');
  }
}

module.exports = PaymentConfirmation;

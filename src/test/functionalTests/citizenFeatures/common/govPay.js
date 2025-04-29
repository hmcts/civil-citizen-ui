const I = actor();
const cy = require('../../../../main/modules/i18n/locales/cy.json');
const en = require('../../../../main/modules/i18n/locales/en.json');

class GovPay {

  getLanguage(language) {
    return (language === 'BOTH') ? cy : en;
  }

  async addValidCardDetails(feeAmount, language) {
    console.log(`addValidCardDetails - Running in language: ${language}`);
    const translations = this.getLanguage(language);

    const sendPaymentConfirmation = translations.PAGES.GENERAL_APPLICATION.GA_PAYMENT.SEND_PAYMENT_CONFIRMATION;
    await I.waitForText(sendPaymentConfirmation);

    I.waitForContent(feeAmount, 60);
    I.fillField('//*[@id="card-no"]', '4444333322221111');
    I.fillField('//*[@id="expiry-month"]', '12');
    I.fillField('//*[@id="expiry-year"]', '32');
    I.fillField('//*[@id="cardholder-name"]', 'John Doe');
    I.fillField('//*[@id="cvc"]', '000');
    I.fillField('//*[@id="address-line-1"]', 'Street 1');
    I.fillField('//*[@id="address-city"]', 'London');
    I.fillField('//*[@id="address-postcode"]', 'N65BQ');
    I.fillField('//*[@id="email"]', 'test@mailinator.com');
    const continueButton = translations.COMMON.BUTTONS.CONTINUE;
    await I.click(continueButton);
  }

  confirmPayment(language) {
    console.log(`confirmPayment - Running in language: ${language}`);
    const translations = this.getLanguage(language);

    I.waitForElement('//*[@id="confirm"]');
    const confirmPaymentButton = translations.COMMON.BUTTONS.CONFIRM_PAYMENT;
    I.click(confirmPaymentButton);

  }
}

module.exports = GovPay;

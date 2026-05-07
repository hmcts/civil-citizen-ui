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

    await I.waitForContent(feeAmount, 60);
    await I.fillField('//*[@id="card-no"]', '4444333322221111');
    await I.fillField('//*[@id="expiry-month"]', '12');
    await I.fillField('//*[@id="expiry-year"]', '32');
    await I.fillField('//*[@id="cardholder-name"]', 'John Doe');
    await I.fillField('//*[@id="cvc"]', '000');
    await I.fillField('//*[@id="address-line-1"]', 'Street 1');
    await I.fillField('//*[@id="address-city"]', 'London');
    await I.fillField('//*[@id="address-postcode"]', 'N65BQ');
    await I.fillField('//*[@id="email"]', 'test@mailinator.com');
    const continueButton = translations.COMMON.BUTTONS.CONTINUE;
    await I.click(continueButton);
  }

  async confirmPayment(language) {
    console.log(`confirmPayment - Running in language: ${language}`);
    const translations = this.getLanguage(language);

    await I.waitForElement('//*[@id="confirm"]');
    const confirmPaymentButton = translations.COMMON.BUTTONS.CONFIRM_PAYMENT;
    await I.click(confirmPaymentButton);

  }
}

module.exports = GovPay;

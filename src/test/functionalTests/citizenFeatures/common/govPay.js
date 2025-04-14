const I = actor();
const cy = require('../../../../main/modules/i18n/locales/cy.json');

class GovPay {

  async addValidCardDetails(feeAmount, language) {
    console.log(`ValidCardDetails - Running in language: ${language}`);
    if (language === 'BOTH')
      I.waitForText('Byddwn yn anfon eich cadarnhad taliad yma',60);
    else 
      I.waitForText('We’ll send your payment confirmation here',60);
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
    if (language === 'BOTH') {
      const continueButton = cy.COMMON.BUTTONS.CONTINUE;
      await I.click(continueButton);
    }
    else {
      await I.click('Continue');
    }
  }

  confirmPayment(language) {
    console.log(`ConfirmPayment - Running in language: ${language}`);
    I.waitForElement('//*[@id="confirm"]');
    if (language === 'BOTH')
      I.click('Cadarnhau’r taliad');
    else 
      I.click('Confirm payment');
  }
}

module.exports = GovPay;

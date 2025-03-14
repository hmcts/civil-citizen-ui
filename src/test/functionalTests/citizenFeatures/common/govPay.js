const I = actor();

class GovPay {

  async addValidCardDetails(feeAmount) {
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
    await I.click('Continue');
  }

  confirmPayment() {
    I.waitForElement('//*[@id="confirm"]');
    I.click('Confirm payment');
  }
}

module.exports = GovPay;

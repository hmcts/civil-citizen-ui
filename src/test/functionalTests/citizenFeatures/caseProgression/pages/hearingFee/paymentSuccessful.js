const I = actor();

class PaymentSuccessful {

  async checkPageFullyLoaded () {
    await I.waitForElement('//*[@id="main-content"]');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(feeAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyBannerDetails();
    await this.verifyPageText(feeAmount);
  }

  async verifyBannerDetails() {
    await I.see('Your payment was', 'h1');
    await I.see('successful', 'h1');
    await I.see('Your payment reference number is', 'span');
  }

  async verifyPageText(feeAmount) {
    await I.see('You\'ll receive a confirmation email in the next hour.');
    await I.see('Payment summary', 'h2');
    await I.see ('Payment for');
    await I.see ('Hearing fee');
    await I.see ('Total amount');
    await I.see ('£' + feeAmount);
    await I.see('Go to your account');
  }
}

module.exports = PaymentSuccessful;

const I = actor();

class PaymentSuccessful {

  checkPageFullyLoaded () {
    I.waitForElement('//*[@id="main-content"]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(feeAmount) {
    this.checkPageFullyLoaded();
    this.verifyBannerDetails();
    this.verifyPageText(feeAmount);
  }

  verifyBannerDetails() {
    I.see('Your payment was', 'h1');
    I.see('successful', 'h1');
    I.see('Your payment reference number is', 'span');
  }

  verifyPageText(feeAmount) {
    I.see('You\'ll receive a confirmation email in the next hour.');
    I.see('Payment summary', 'h2');
    I.see ('Payment for');
    I.see ('Hearing fee');
    I.see ('Total amount');
    I.see ('£' + feeAmount);
    I.see('Close and return to case overview');
  }
}

module.exports = PaymentSuccessful;

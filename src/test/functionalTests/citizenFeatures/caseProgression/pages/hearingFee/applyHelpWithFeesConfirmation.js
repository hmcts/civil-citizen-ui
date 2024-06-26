const I = actor();

class ApplyHelpWithFeesConfirmation {

  checkPageFullyLoaded () {
    I.waitForElement('//*[@id="main-content"]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBannerDetails();
    this.verifyPageText();
  }

  verifyBannerDetails() {
    I.see('Your application for help with the hearing fee is complete', 'h1');
    I.see('Your reference number');
    I.see('HWF-A1B-23C');
  }

  verifyPageText() {
    I.see('What happens next', 'h3');
    I.see('You\'ll receive a decision on your application within 5 to 10 working days.');
    I.see('Close and return to case overview');
  }
}

module.exports = ApplyHelpWithFeesConfirmation;

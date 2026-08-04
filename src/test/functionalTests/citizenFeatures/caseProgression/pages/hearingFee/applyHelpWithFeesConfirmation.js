const I = actor();

class ApplyHelpWithFeesConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//*[@id="main-content"]');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent() {
    await this.checkPageFullyLoaded();
    await this.verifyBannerDetails();
    await this.verifyPageText();
  }

  async verifyBannerDetails() {
    await I.see('Your application for help with the hearing fee is complete', 'h1');
    await I.see('Your reference number');
    await I.see('HWF-A1B-23C');
  }

  async verifyPageText() {
    await I.see('What happens next', 'h2');
    await I.see('You\'ll receive a decision on your application within 5 to 10 working days.');
    await I.see('Go to your account');
  }
}

module.exports = ApplyHelpWithFeesConfirmation;

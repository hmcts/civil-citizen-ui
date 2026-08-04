const I = actor();

class RequestForReconsiderationConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(partyName, deadline) {
    await this.checkPageFullyLoaded();
    await this.verifyBannerDetails();
    await this.verifyPageText(partyName, deadline);
  }

  async verifyBannerDetails() {
    await I.see('You’ve asked the court to review order', 'h1');
    await I.seeElement('//a[contains(@class, \'govuk-link\') and normalize-space(text())=\'Download request for review of order (PDF)\']');
  }

  async verifyPageText(partyName, deadline) {
    await I.see('What happens next', 'h1');
    await I.see('We’ll tell ' + partyName + ' you’ve made the request. They will have until ' + deadline + ' to add comments of their own.');
    await I.see('Continue doing what the current order asks of you unless you’re informed a judge has made a new order.');
  }
}

module.exports = RequestForReconsiderationConfirmation;

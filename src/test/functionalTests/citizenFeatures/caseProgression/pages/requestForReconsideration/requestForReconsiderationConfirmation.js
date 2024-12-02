const I = actor();

class RequestForReconsiderationConfirmation {

  checkPageFullyLoaded () {
    I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(partyName, deadline) {
    this.checkPageFullyLoaded();
    this.verifyBannerDetails();
    this.verifyPageText(partyName, deadline);
  }

  verifyBannerDetails() {
    I.see('You’ve asked the court to review order', 'h1');
    I.seeElement('//a[contains(@class, \'govuk-link\') and normalize-space(text())=\'Download request for review of order (PDF)\']');
  }

  verifyPageText(partyName, deadline) {
    I.see('What happens next', 'h1');
    I.see('We’ll tell ' + partyName + ' you’ve made the request. They will have until ' + deadline + ' to add comments of their own.');
    I.see('Continue doing what the current order asks of you unless you’re informed a judge has made a new order.');
  }
}

module.exports = RequestForReconsiderationConfirmation;

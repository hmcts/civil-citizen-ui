const I = actor();

class CommentsForReconsiderationConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(partyName) {
    await this.checkPageFullyLoaded();
    await this.verifyBannerDetails();
    await this.verifyPageText(partyName);
  }

  async verifyBannerDetails() {
    await I.see('Your comments have been submitted successfully.', 'h1');
  }

  async verifyPageText(partyName) {
    await I.see('What happens next', 'h1');
    await I.see('We will let ' + partyName + ' know that you’ve submitted comments on the order.');
    await I.see('A judge will now review the order and the comments. We’ll contact all parties to update you on the next steps.');
    await I.see('You should continue to do what the order asks of you unless you hear that a judge has made a new order.');
  }
}

module.exports = CommentsForReconsiderationConfirmation;

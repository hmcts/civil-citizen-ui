const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class PayHearingFee {

  async open(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/case-progression/pay-hearing-fee');
  }

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[contains(.,\'Start now\')]');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(feeAmount, dueDate, caseNumber, claimAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText(feeAmount, dueDate);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Home', 'li');
    await I.see('Pay the hearing Fee', 'li');
  }

  async verifyHeadingDetails() {
    await I.see('Hearing', 'span');
    await I.see('Pay hearing fee', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber, 'p');
    await I.see('Claim amount: ' + claimAmount, 'p');
  }

  async verifyPageText(feeAmount, dueDate) {
    await I.see('You must pay a fee of £' + feeAmount + ' by ' + dueDate + '.');
    await I.see('If you do not pay by this date, your case may be struck out.');
    await I.see('Cancel','//a[.=\'Cancel\']');
  }

}

module.exports = PayHearingFee;

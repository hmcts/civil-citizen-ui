const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class PayHearingFee {

  open(claimRef) {
    I.amOnPage('/case/' + claimRef + '/case-progression/pay-hearing-fee');
  }

  checkPageFullyLoaded () {
    I.waitForElement('//a[contains(.,\'Start now\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(feeAmount, dueDate) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyPageText(feeAmount, dueDate);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Home', 'li');
    I.see('Pay the hearing Fee', 'li');
  }

  verifyHeadingDetails() {
    I.see('Hearing fee', 'span');
    I.see('Pay hearing fee', 'h1');
  }

  verifyPageText(feeAmount, dueDate) {
    I.see('You must pay a fee of £' + feeAmount + ' by ' + dueDate + '.');
    I.see('If you do not pay by this date, your case may be struck out.');
    I.see('Cancel','//a[.=\'Cancel\']');
  }

}

module.exports = PayHearingFee;

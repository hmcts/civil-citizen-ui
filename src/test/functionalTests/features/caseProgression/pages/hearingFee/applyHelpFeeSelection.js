const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpFeeSelection {

  checkPageFullyLoaded () {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//*[@id="main-content"]/div/main/div/div[1]/div[1]/a');
  }

  verifyHeadingDetails() {
    I.see('Hearing fee', 'span');
    I.see('Pay hearing fee', 'h1');
  }

  verifyPageText() {
    I.see('If you\'re on a low income, have limited savings or are claiming benefits, you may able to get');
    I.see('If you meet the criteria, you may get support to pay some or all of the fee.');
    I.see('Do you want to apply for help with fees?', 'h3');
    I.see('Yes');
    I.see('No');
  }
}

module.exports = ApplyHelpFeeSelection;

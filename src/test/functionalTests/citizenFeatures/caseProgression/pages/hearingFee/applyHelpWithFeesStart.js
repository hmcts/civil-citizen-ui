const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFeesStart {

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
    I.see('Apply for help with fees', 'h1');
  }

  verifyPageText() {
    I.see('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.');
    I.see('Instead, you should make a new help with fees application which will provide you with a new reference number. Note down this number and keep it safe as you will need it later in the process.');
    I.see('During your application, you will be asked for the number of your court or tribunal form. Enter \'hearing fee\' followed by short explanation, for example \'hearing fee small claims\' or \'hearing fee for fast track\'.');
    I.see('Once you have made your application, return to this page and click continue to proceed.');
    I.see('Apply for Help with Fees (open in a new window)');
    I.seeElement('//*[@id="main-content"]/div/main/div/div[1]/form/p[5]/a');
  }
}

module.exports = ApplyHelpWithFeesStart;

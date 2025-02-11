const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpFeeSelection {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  async verifyPageContentForAdditionalFee(){
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetailsForAdditionalFee();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('Application fee', 'span');
    I.see('Pay application fee', 'h1');
  }

  verifyHeadingDetailsForAdditionalFee() {
    I.see('Additional application fee', 'span');
    I.see('Pay additional application fee', 'h1');
  }

  async verifyPageText() {
    I.see('If you\'re on a low income, have limited savings or are claiming benefits, you may be able to get help with fees (opens in a new tab).');
    I.see('If you meet the criteria, you may get support to pay some or all of the fee.');
    await I.seeElement('//a[@class=\'govuk-link\' and contains(text(), \'help with fees (opens in a new tab)\')]\n');
    I.see('Do you want to apply for help with fees?', 'h2');
    I.see('Yes');
    await I.see('No');
  }
}

module.exports = ApplyHelpFeeSelection;

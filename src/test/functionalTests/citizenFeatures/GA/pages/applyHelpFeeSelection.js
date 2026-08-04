const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpFeeSelection {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent() {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyPageContentForAdditionalFee(){
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetailsForAdditionalFee();
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async confirmActions(option, tries = 0){
    const currentUrl = await I.grabCurrentUrl();
    await this.verifyPageContent();
    await this.nextAction(option);
    await this.nextAction('Continue');
    const redirectedUrl = await I.grabCurrentUrl();
    if (currentUrl === redirectedUrl && tries < 3) {
      tries = ++tries;
      console.log('Retrying apply help with fees page... attempt ', tries);
      await this.confirmActions(option, tries);
    }
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails() {
    await I.see('Application fee', 'span');
    await I.see('Pay application fee', 'h1');
  }

  async verifyHeadingDetailsForAdditionalFee() {
    await I.see('Additional application fee', 'span');
    await I.see('Pay additional application fee', 'h1');
  }

  async verifyPageText() {
    await I.see('If you\'re on a low income, have limited savings or are claiming benefits, you may be able to get help with fees (opens in a new tab).');
    await I.see('If you meet the criteria, you may get support to pay some or all of the fee.');
    await I.seeElement('//a[@class=\'govuk-link\' and contains(text(), \'help with fees (opens in a new tab)\')]\n');
    await I.see('Do you want to apply for help with fees?', 'h2');
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = ApplyHelpFeeSelection;

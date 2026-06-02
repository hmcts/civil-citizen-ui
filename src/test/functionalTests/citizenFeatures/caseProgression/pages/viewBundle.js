const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewBundle {

  async checkPageFullyLoaded() {
    await I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount, dateUploaded, partyType) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText();
    await this.verifyTable(dateUploaded, partyType);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Home', 'li');
    await I.see('View the bundle', 'li');
  }

  async verifyHeadingDetails() {
    await I.see('Hearing', 'span');
    await I.see('View the bundle', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText() {
    await I.see('You can find the bundle below.');
    await I.see('As the bundle has now been created, you will have to apply to the court if you want any new documents you upload to be used at your trial or hearing.');
    await I.seeElement('//a[text()=\'apply to the court\']');
    await I.see('Any new documents you upload will not be included in the main bundle. They will be listed separately below and under \'Documents\'.');
  }

  async verifyTable(dateUploaded, partyType) {
    await I.see('Document name', '(//th[@class=\'govuk-table__header\'])[1]');
    await I.see('Date uploaded', '(//th[@class=\'govuk-table__header\'])[2]');
    await I.see('Document', '(//th[@class=\'govuk-table__header\'])[3]');
    await I.see('Bundle 1', '(//td[@class=\'govuk-table__cell\'])[1]');
    await I.see(dateUploaded, '(//td[@class=\'govuk-table__cell\'])[2]');
    if (partyType === 'LRvLiP'){
      await I.seeElement('//a[contains(text(), "-Bundle.pdf")]');
      await I.see('-Bundle.pdf', '(//td[@class=\'govuk-table__cell\'])[3]');
    }
  }
}
module.exports = ViewBundle;

const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewBundle {

  checkPageFullyLoaded() {
    I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, dateUploaded, partyType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyPageText();
    this.verifyTable(dateUploaded, partyType);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Home', 'li');
    I.see('View the bundle', 'li');
  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see('View the bundle', 'h1');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber);
    I.see('Claim amount: ' + claimAmount);
  }

  verifyPageText() {
    I.see('You can find the bundle below.');
    I.see('As the bundle has now been created, you will have to apply to the court if you want any new documents you upload to be used at your trial or hearing.');
    I.seeElement('//a[text()=\'apply to the court\']');
    I.see('Any new documents you upload will not be included in the main bundle. They will be listed separately below and under \'Documents\'.');
  }

  verifyTable(dateUploaded, partyType) {
    I.see('Document name', '(//th[@class=\'govuk-table__header\'])[1]');
    I.see('Date uploaded', '(//th[@class=\'govuk-table__header\'])[2]');
    I.see('Document', '(//th[@class=\'govuk-table__header\'])[3]');
    I.see('Bundle 1', '(//td[@class=\'govuk-table__cell\'])[1]');
    I.see(dateUploaded, '(//td[@class=\'govuk-table__cell\'])[2]');
    if (partyType === 'LRvLiP'){
      I.seeElement('//a[text()=\'Test Inc v Doe-18102024-Bundle.pdf\']');
      I.see('Test Inc v Doe-18102024-Bundle.pdf', '(//td[@class=\'govuk-table__cell\'])[3]');
    }
  }
}
module.exports = ViewBundle;

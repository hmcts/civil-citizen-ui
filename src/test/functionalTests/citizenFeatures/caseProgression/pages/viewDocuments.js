const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewDocuments {

  checkPageFullyLoaded() {
    I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, dateUploaded) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyPageText();
    this.verifyClaimantWitnessEvidenceSection(dateUploaded);
    this.verifyClaimantExpertEvidenceSection(dateUploaded);
    this.verifyClaimantHearingDocumentsSection(dateUploaded);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Home', 'li');
    I.see('View documents', 'li');
  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see('View documents', 'h1');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber);
    I.see('Claim amount: ' + claimAmount);
  }

  verifyPageText() {
    I.see('Read and save all documents uploaded by the parties involved in the claim. Three weeks before the hearing, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
  }

  verifyClaimantWitnessEvidenceSection(dateUploaded) {
    const docsReferredStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant documents referred to in statement\')]]';
    I.see('Claimant witness evidence', 'span');
    I.see('Claimant documents referred to in statement', docsReferredStatementLocator);
    I.seeElement('//a[.=\'Documents referred Type of Document 2 referred to in the statement of Documents referred witness name 2 06-02-2023.jpg\']', docsReferredStatementLocator);
    I.seeElement('//a[.=\'Documents referred Type of Document 1 referred to in the statement of Documents referred witness name 1 05-02-2023.jpeg\']', docsReferredStatementLocator);
    I.see('Date uploaded [' + dateUploaded + ']', docsReferredStatementLocator);

    const witnessSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant witness summary\')]]';
    I.see('Claimant witness summary', witnessSummaryLocator);
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Name 2 04-02-2023.docx\']', witnessSummaryLocator);
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Name 1 03-02-2023.doc\']', witnessSummaryLocator);
    I.see('Date uploaded [' + dateUploaded + ']', witnessSummaryLocator);

    const witnessStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant witness statement\')]]';
    I.see('Claimant witness statement', witnessStatementLocator);
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Name 2 02-02-2023.csv\']', witnessStatementLocator);
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Name 1 01-02-2023.bmp\']', witnessStatementLocator);
    I.see('Date uploaded [' + dateUploaded + ']', witnessStatementLocator);
  }

  verifyClaimantExpertEvidenceSection(dateUploaded) {
    I.see('Claimant expert evidence', 'span');
    const jointStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Joint statement of experts\')]]';
    I.see('Joint statement of experts', jointStatementLocator);
    I.seeElement('//a[.=\'Joint report Expert Statement - Expert Name 2 Expert Statement - Field Of Expertise 2 10-02-2023.rtf\']', jointStatementLocator);
    I.seeElement('//a[.=\'Joint report Expert Statement - Expert Name 1 Expert Statement - Field Of Expertise 1 09-02-2023.ppt\']', jointStatementLocator);
    I.see('Date uploaded [' + dateUploaded + ']', jointStatementLocator);

    const expertReportLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant expert report\')]]';
    I.see('Claimant expert report', expertReportLocator);
    I.seeElement('//a[.=\'Experts report Expert Report - Expert Name 2 Expert Report - Field of Expertise 2 08-02-2023.png\']', expertReportLocator);
    I.seeElement('//a[.=\'Experts report Expert Report - Expert Name 1 Expert Report - Field of Expertise 1 07-02-2023.pdf\']', expertReportLocator);
    I.see('Date uploaded [' + dateUploaded + ']', expertReportLocator);
  }

  verifyClaimantHearingDocumentsSection(dateUploaded) {
    I.see('Claimant hearing documents', 'span');
    const legalAuthoritiesLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant legal authorities\')]]';
    I.see('Claimant legal authorities', legalAuthoritiesLocator);
    I.seeElement('//a[.=\'TestXLSX.xlsx\']', legalAuthoritiesLocator);
    I.seeElement('//a[.=\'TestXLS.xls\']', legalAuthoritiesLocator);
    I.see('Date uploaded [' + dateUploaded + ']', legalAuthoritiesLocator);

    const documentaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant documentary evidence\')]]';
    I.see('Claimant documentary evidence', documentaryLocator);
    I.seeElement('//a[.=\'Documentary Evidence Documentary evidence for the hearing - Type of Document 2 12-02-2023.tiff\']', documentaryLocator);
    I.seeElement('//a[.=\'Documentary Evidence Documentary evidence for the hearing - Type of Document 1 11-02-2023.tif\']', documentaryLocator);
    I.see('Date uploaded [' + dateUploaded + ']', documentaryLocator);
  }

}
module.exports = ViewDocuments;

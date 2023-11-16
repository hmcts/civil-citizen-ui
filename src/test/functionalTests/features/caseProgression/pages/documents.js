const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Documents {

  open(claimRef, claimType) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyLatestUpdatePageContent(claimType);
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent(claimType) {
    this.verifyHeadingDetails();
    this.verifyDocumentSectionContent();
    if (claimType === 'FastTrack') {
      this.verifyFastTrackDocumentsUploadedSectionContent();
    } else if (claimType === 'SmallClaims') {
      this.verifySmallClaimsDocumentsUploadedSectionContent();
    }
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Test Inc v Sir John Doe', 'h1');
    I.see('Claim number: ');
    I.see('Updates');
    I.see('Notices and orders');
    I.see('Documents');
  }

  verifyFastTrackDocumentsUploadedSectionContent() {

    I.see('Defendant disclosure');
    I.see('Defendant documents for disclosure');
    I.see('Date uploaded');
    I.seeElement('//a[.=\'Document for disclosure Test Data Entry for Document Disclosure 1 01-02-2023.txt\']');
    I.seeElement('//a[.=\'Document for disclosure Test Data Entry for Document Disclosure 2 02-02-2023.doc\']');
    I.see('Defendant disclosure list');
    I.seeElement('//a[.=\'TestDOCX.docx\']');
    I.seeElement('//a[.=\'TestPDF.pdf\']');

    I.see('Defendant witness evidence');
    I.see('Defendant witness statement');
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 1 03-02-2023.xls\']');
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 2 04-02-2023.xlsx\']');
    I.see('Defendant witness summary');
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 1.ppt\']');
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 2.png\']');
    I.see('Defendant intention to rely on hearsay evidence');
    I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness nae 1 07-02-2023.rtf\']');
    I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness nae 2 08-02-2023.tif\']');
    I.see('Defendant documents referred to in statement');
    I.seeElement('//a[.=\'Referred Document Docuents referred Type of Docuent 1 09-02-2023.tiff\']');
    I.seeElement('//a[.=\'Referred Document Docuents referred Type of Docuent 2 10-02-2023.docx\']');

    I.see('Defendant expert evidence');
    I.see('Defendant expert report');
    I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 1 Expert Report - Field of Expertise 1\')]');
    I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 2 Expert Report - Field of Expertise 2\')]');
    I.see('Joint statement of experts');
    I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 1 Expert Stateent - Field Of Expertise\')]');
    I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 2 Expert Stateent - Field Of Expertise\')]');
    I.see('Defendant questions for other party\'s expert or joint expert');
    I.seeElement('//a[.=\'Questions for Expert 1 Test Inc Questions for Expert Docuent Nae 1.jpeg\']');
    I.seeElement('//a[.=\'Questions for Expert 2 Test Inc Questions for Expert Docuent Nae 2.txt\']');
    I.see('Defendant answers to questions asked by other party');
    I.seeElement('//a[.=\'Answers for Expert 1 Test Inc Answers for Expert Docuent Nae 1.txt\']');
    I.seeElement('//a[.=\'Answers for Expert 2 Test Inc Answers for Expert Docuent Nae 2.txt\']');

    I.see('Defendant trial documents');
    I.see('Defendant case summary');
    I.see('Defendant skeleton argument');
    I.see('Defendant legal authorities');
    I.see('Defendant costs');
    I.see('Defendant documentary evidence');
    I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for trial - Type of Document 1 15-02-2\')]');
    I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for trial - Type of Document 2 15-02-2\')]');

  }

  verifySmallClaimsDocumentsUploadedSectionContent() {

    I.see('Defendant witness evidence');
    I.see('Defendant witness statement');
    I.see('Date uploaded');
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 1 01-02-2023.bmp\']');
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 2 02-02-2023.csv\']');

    I.see('Defendant witness summary');
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 1.doc\']');
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 2.docx\']');

    I.see('Defendant documents referred to in statement');
    I.seeElement('//a[.=\'Referred Document Docuents referred Type of Docuent 1 05-02-2023.jpeg\']');
    I.seeElement('//a[.=\'Referred Document Docuents referred Type of Docuent 2 06-02-2023.jpg\']');

    I.see('Defendant expert evidence');
    I.see('Defendant expert report');
    I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 1 Expert Report - Field of Expertise 1\')]');
    I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 2 Expert Report - Field of Expertise 2\')]');

    I.see('Joint statement of experts');
    I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 1 Expert Stateent - Field Of Expertise\')]');
    I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 2 Expert Stateent - Field Of Expertise\')]');

    I.see('Defendant hearing documents');
    I.see('Defendant documentary evidence');
    I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for the hearing - Type of Document 1 11-02\')]');
    I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for the hearing - Type of Document 2 12-02\')]');
    I.see('Defendant legal authorities');
    I.seeElement('//a[.=\'TestXLS.xls\']');
    I.seeElement('//a[.=\'TestXLSX.xlsx\']');
  }

  verifyDocumentSectionContent() {
    I.see('Upload documents', 'h3');
    I.see('Read and save all documents uploaded by the parties involved in the claim. Three weeks before the trial, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
  }
}

module.exports = Documents;

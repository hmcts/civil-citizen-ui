const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Documents {

  open(claimRef, claimType, claimantFlag) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.nextAction('//*[@id="tab_documents"]');
    this.verifyLatestUpdatePageContent(claimType, claimantFlag);
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent(claimType, claimantFlag = false) {
    this.verifyHeadingDetails();
    this.verifyDocumentSectionContent();
    if (claimantFlag === false) {
      if (claimType === 'FastTrack') {
        this.verifyFastTrackDocumentsUploadedSectionDefendantContent();
      } else if (claimType === 'SmallClaims') {
        this.verifySmallClaimsDocumentsUploadedSectionDefendantContent();
      }
    }
    if (claimantFlag === true) {
      if (claimType === 'FastTrack') {
        this.verifyFastTrackDocumentsUploadedSectionClaimantContent();
      } else if (claimType === 'SmallClaims') {
        this.verifySmallClaimsDocumentsUploadedSectionClaimantContent();
      }
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

  verifyFastTrackDocumentsUploadedSectionDefendantContent() {
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
    I.seeElement('//a[.=\'Docuents referred Type of Docuent 1 referred to in the statement of null 09-02-2023.tiff\']');
    I.seeElement('//a[.=\'Docuents referred Type of Docuent 2 referred to in the statement of null 10-02-2023.docx\']');

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

  verifySmallClaimsDocumentsUploadedSectionDefendantContent() {
    I.see('Defendant witness evidence');
    I.see('Defendant witness statement');
    I.see('Date uploaded');
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 1 01-02-2023.bmp\']');
    I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 2 02-02-2023.csv\']');

    I.see('Defendant witness summary');
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 1.doc\']');
    I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 2.docx\']');

    I.see('Defendant documents referred to in statement');
    I.seeElement('//a[.=\'Docuents referred Type of Docuent 1 referred to in the statement of null 05-02-2023.jpeg\']');
    I.seeElement('//a[.=\'Docuents referred Type of Docuent 2 referred to in the statement of null 06-02-2023.jpg\']');

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

  verifyFastTrackDocumentsUploadedSectionClaimantContent() {
    I.see('Claimant disclosure');
    I.see('Claimant disclosure list');
    I.see('Date uploaded');
    I.see('Order_2023-10-09.pdf');
    I.see('Claimant documents for disclosure');
    I.see('Document for disclosure Testing 01-03-2023.pdf');

    I.see('Claimant witness evidence');
    I.see('Claimant witness statement');
    I.see('Witness Statement of Witness Nae 01-03-2023.pdf');
    I.see('Claimant witness summary');
    I.see('Witness Summary of Suary 23.pdf');
    I.see('Claimant intention to rely on hearsay evidence');
    I.see('Hearsay evidence Witness 01-03-2023.pdf');
    I.see('Claimant documents referred to in statement');
    I.see('Upper referred to in the statement of john 01-01-2023.pdf');

    I.see('Claimant expert evidence');
    I.see('Claimant expert report');
    I.see('Experts report nae Expertise 02-03-2023.pdf');
    I.see('Joint statement of experts');
    I.see('Joint report Nae expertise 01-04-2023.pdf');
    I.see('Claimant questions for other party\'s expert or joint expert');
    I.see('testing Party Document.pdf');
    I.see('Claimant answers to questions asked by other party');
    I.see('Ep Other party Question.pdf');

    I.see('Claimant trial documents');
    I.see('Claimant case summary');
    I.see('Order_2023-10-09.pdf');
    I.see('Claimant skeleton argument');
    I.see('fast_track_sdo_000MC014.pdf');
    I.see('Claimant legal authorities');
    I.see('000MC038-claim-response.pdf');
    I.see('Claimant costs');
    I.see('hearing_small_claim_000MC013.pdf');
    I.see('Claimant documentary evidence');
    I.see('Documentary Evidence Deadline 01-02-2023.pdf');
  }

  verifySmallClaimsDocumentsUploadedSectionClaimantContent() {
    I.see('Claimant witness evidence');
    I.see('Claimant witness statement');
    I.see('Witness Statement of Witness Nae 01-03-2023.pdf');
    I.see('Claimant witness summary');
    I.see('Witness Summary of Suary 23.pdf');
    I.see('Claimant documents referred to in statement');
    I.see('Upper referred to in the statement of john 01-01-2023.pdf');

    I.see('Claimant expert evidence');
    I.see('Claimant expert report');
    I.see('Experts report nae Expertise 02-03-2023.pdf');
    I.see('Joint statement of experts');
    I.see('Joint report Nae expertise 01-04-2023.pdf');

    I.see('Claimant hearing documents');
    I.see('Claimant legal authorities');
    I.see('000MC038-claim-response.pdf');
    I.see('Claimant costs');
    I.see('hearing_small_claim_000MC013.pdf');
    I.see('Claimant documentary evidence');
    I.see('Documentary Evidence Deadline 01-02-2023.pdf');
  }

  verifyDocumentSectionContent() {
    I.see('Upload documents', 'h3');
    I.see('Read and save all documents uploaded by the parties involved in the claim. Three weeks before the trial, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
  }
}

module.exports = Documents;

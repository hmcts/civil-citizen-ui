const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Documents {

  async open(claimRef, claimType, claimantFlag) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await this.nextAction('//*[@id="tab_documents"]');
    await this.verifyLatestUpdatePageContent(claimType, claimantFlag);
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyLatestUpdatePageContent(claimType, claimantFlag = false) {
    await this.verifyHeadingDetails();
    await this.verifyDocumentSectionContent();
    if (claimantFlag === false) {
      if (claimType === 'FastTrack') {
        await this.verifyFastTrackDocumentsUploadedSectionDefendantContent();
      } else if (claimType === 'SmallClaims') {
        await this.verifySmallClaimsDocumentsUploadedSectionDefendantContent();
      }
    }
    if (claimantFlag === true) {
      if (claimType === 'FastTrack') {
        await this.verifyFastTrackDocumentsUploadedSectionClaimantContent();
      } else if (claimType === 'SmallClaims') {
        await this.verifySmallClaimsDocumentsUploadedSectionClaimantContent();
      }
    }
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Test Inc v Sir John Doe', 'h1');
    await I.see('Claim number: ');
    await I.see('Updates');
    await I.see('Notices and orders');
    await I.see('Documents');
  }

  async verifyFastTrackDocumentsUploadedSectionDefendantContent() {
    await I.see('Defendant disclosure');
    await I.see('Defendant documents for disclosure');
    await I.see('Date uploaded');
    await I.seeElement('//a[.=\'Document for disclosure Test Data Entry for Document Disclosure 1 01-02-2023.txt\']');
    await I.seeElement('//a[.=\'Document for disclosure Test Data Entry for Document Disclosure 2 02-02-2023.doc\']');
    await I.see('Defendant disclosure list');
    await I.seeElement('//a[.=\'TestDOCX.docx\']');
    await I.seeElement('//a[.=\'TestPDF.pdf\']');

    await I.see('Defendant witness evidence');
    await I.see('Defendant witness statement');
    await I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 1 03-02-2023.xls\']');
    await I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 2 04-02-2023.xlsx\']');
    await I.see('Defendant witness summary');
    await I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 1 05-02-2023.ppt\']');
    await I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 2 06-02-2023.png\']');
    await I.see('Defendant intention to rely on hearsay evidence');
    await I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness nae 1 07-02-2023.rtf\']');
    await I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness nae 2 08-02-2023.tif\']');
    await I.see('Defendant documents referred to in statement');
    await I.seeElement('//a[.=\'Docuents referred Type of Docuent 1 referred to in the statement of Docuents referred witness nae 1 09-02-2023.tiff\']');
    await I.seeElement('//a[.=\'Docuents referred Type of Docuent 2 referred to in the statement of Docuents referred witness nae 2 10-02-2023.docx\']');

    await I.see('Defendant expert evidence');
    await I.see('Defendant expert report');
    await I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 1 Expert Report - Field of Expertise 1\')]');
    await I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 2 Expert Report - Field of Expertise 2\')]');
    await I.see('Joint statement of experts');
    await I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 1 Expert Stateent - Field Of Expertise\')]');
    await I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 2 Expert Stateent - Field Of Expertise\')]');
    await I.see('Defendant questions for other party\'s expert or joint expert');
    await I.seeElement('//a[.=\'Questions for Expert 1 Test Inc Questions for Expert Docuent Nae 1.jpeg\']');
    await I.seeElement('//a[.=\'Questions for Expert 2 Test Inc Questions for Expert Docuent Nae 2.txt\']');
    await I.see('Defendant answers to questions asked by other party');
    await I.seeElement('//a[.=\'Answers for Expert 1 Test Inc Answers for Expert Docuent Nae 1.txt\']');
    await I.seeElement('//a[.=\'Answers for Expert 2 Test Inc Answers for Expert Docuent Nae 2.txt\']');

    await I.see('Defendant trial documents');
    await I.see('Defendant case summary');
    await I.see('Defendant skeleton argument');
    await I.see('Defendant legal authorities');
    await I.see('Defendant costs');
    await I.see('Defendant documentary evidence');
    await I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for trial - Type of Document 1 15-02-2\')]');
    await I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for trial - Type of Document 2 15-02-2\')]');
  }

  async verifySmallClaimsDocumentsUploadedSectionDefendantContent() {
    await I.see('Defendant witness evidence');
    await I.see('Defendant witness statement');
    await I.see('Date uploaded');
    await I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 1 01-02-2023.bmp\']');
    await I.seeElement('//a[.=\'Witness Statement of Witness Statement - Witness Nae 2 02-02-2023.csv\']');

    await I.see('Defendant witness summary');
    await I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 1 03-02-2023.doc\']');
    await I.seeElement('//a[.=\'Witness Summary of Witness Summary - Witness Nae 2 04-02-2023.docx\']');

    await I.see('Defendant documents referred to in statement');
    await I.seeElement('//a[.=\'Docuents referred Type of Docuent 1 referred to in the statement of Docuents referred witness nae 1 05-02-2023.jpeg\']');
    await I.seeElement('//a[.=\'Docuents referred Type of Docuent 2 referred to in the statement of Docuents referred witness nae 2 06-02-2023.jpg\']');

    await I.see('Defendant expert evidence');
    await I.see('Defendant expert report');
    await I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 1 Expert Report - Field of Expertise 1\')]');
    await I.seeElement('//a[contains(.,\'Experts report Expert Report - Expert Nae 2 Expert Report - Field of Expertise 2\')]');

    await I.see('Joint statement of experts');
    await I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 1 Expert Stateent - Field Of Expertise\')]');
    await I.seeElement('//a[contains(.,\'Joint report Expert Stateent - Expert Nae 2 Expert Stateent - Field Of Expertise\')]');

    await I.see('Defendant hearing documents');
    await I.see('Defendant documentary evidence');
    await I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for the hearing - Type of Document 1 11-02\')]');
    await I.seeElement('//a[contains(.,\'Documentary Evidence Documentary evidence for the hearing - Type of Document 2 12-02\')]');
    await I.see('Defendant legal authorities');
    await I.seeElement('//a[.=\'TestXLS.xls\']');
    await I.seeElement('//a[.=\'TestXLSX.xlsx\']');
  }

  async verifyFastTrackDocumentsUploadedSectionClaimantContent() {
    await I.see('Claimant disclosure');
    await I.see('Claimant disclosure list');
    await I.see('Date uploaded');
    await I.see('Order_2023-10-09.pdf');
    await I.see('Claimant documents for disclosure');
    await I.see('Document for disclosure Testing 01-03-2023.pdf');

    await I.see('Claimant witness evidence');
    await I.see('Claimant witness statement');
    await I.see('Witness Statement of Witness Nae 01-03-2023.pdf');
    await I.see('Claimant witness summary');
    await I.see('Witness Summary of Suary 23 01-01-2020.pdf');
    await I.see('Claimant intention to rely on hearsay evidence');
    await I.see('Hearsay evidence Witness 01-03-2023.pdf');
    await I.see('Claimant documents referred to in statement');
    await I.see('Upper referred to in the statement of john 01-01-2023.pdf');

    await I.see('Claimant expert evidence');
    await I.see('Claimant expert report');
    await I.see('Experts report nae Expertise 02-03-2023.pdf');
    await I.see('Joint statement of experts');
    await I.see('Joint report Nae expertise 01-04-2023.pdf');
    await I.see('Claimant questions for other party\'s expert or joint expert');
    await I.see('testing Party Document.pdf');
    await I.see('Claimant answers to questions asked by other party');
    await I.see('Ep Other party Question.pdf');

    await I.see('Claimant trial documents');
    await I.see('Claimant case summary');
    await I.see('Order_2023-10-09.pdf');
    await I.see('Claimant skeleton argument');
    await I.see('fast_track_sdo_000MC014.pdf');
    await I.see('Claimant legal authorities');
    await I.see('000MC038-claim-response.pdf');
    await I.see('Claimant costs');
    await I.see('hearing_small_claim_000MC013.pdf');
    await I.see('Claimant documentary evidence');
    await I.see('Documentary Evidence Deadline 01-02-2023.pdf');
  }

  async verifySmallClaimsDocumentsUploadedSectionClaimantContent() {
    await I.see('Claimant witness evidence');
    await I.see('Claimant witness statement');
    await I.see('Witness Statement of Witness Nae 01-03-2023.pdf');
    await I.see('Claimant witness summary');
    await I.see('Witness Summary of Suary 23 01-01-2020.pdf');
    await I.see('Claimant documents referred to in statement');
    await I.see('Upper referred to in the statement of john 01-01-2023.pdf');

    await I.see('Claimant expert evidence');
    await I.see('Claimant expert report');
    await I.see('Experts report nae Expertise 02-03-2023.pdf');
    await I.see('Joint statement of experts');
    await I.see('Joint report Nae expertise 01-04-2023.pdf');

    await I.see('Claimant hearing documents');
    await I.see('Claimant legal authorities');
    await I.see('000MC038-claim-response.pdf');
    await I.see('Claimant costs');
    await I.see('hearing_small_claim_000MC013.pdf');
    await I.see('Claimant documentary evidence');
    await I.see('Documentary Evidence Deadline 01-02-2023.pdf');
  }

  async verifyDocumentSectionContent() {
    await I.see('Upload documents', 'h3');
    await I.see('Read and save all documents uploaded by the parties involved in the claim. 10 days before the hearing, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
  }
}

module.exports = Documents;

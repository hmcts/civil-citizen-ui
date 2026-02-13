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

  verifyPageContent(caseNumber, claimAmount, dateUploaded, claimType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyPageText();
    if (claimType === 'FastTrack') {
      this.verifyClaimantDisclosureSection(dateUploaded);
    }
    /*this.verifyClaimantWitnessEvidenceSection(dateUploaded, claimType);
    this.verifyDefendantWitnessEvidenceSection(dateUploaded, claimType);
    this.verifyClaimantExpertEvidenceSection(dateUploaded, claimType, partyType);
    this.verifyDefendantExpertEvidenceSection(dateUploaded, claimType);
    this.verifyClaimantHearingDocumentsSection(dateUploaded, claimType);
    this.verifyDefendantHearingDocumentsSection(dateUploaded, claimType);*/
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
    I.see('Read and save all documents uploaded by the parties involved in the claim. 10 days before the hearing, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
  }

  verifyClaimantDisclosureSection(dateUploaded) {
    const disclosureListLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant disclosure list\')]]';
    I.see('Claimant disclosure', 'span');
    I.see('Claimant disclosure list', disclosureListLocator);
    I.seeElement('//a[.=\'TestPDF.pdf\']', disclosureListLocator);
    I.seeElement('//a[.=\'TestDOCX.docx\']', disclosureListLocator);
    I.see('Date uploaded [' + dateUploaded + ']', disclosureListLocator);

    const claimantDocumentsForDisclosureLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant documents for disclosure\')]]';
    I.see('Claimant documents for disclosure', claimantDocumentsForDisclosureLocator);
    I.seeElement('//a[.=\'Document for disclosure Test Data Entry for Document Disclosure 2 02-02-2023.doc\']', claimantDocumentsForDisclosureLocator);
    I.seeElement('//a[.=\'Document for disclosure Test Data Entry for Document Disclosure 1 01-02-2023.txt\']', claimantDocumentsForDisclosureLocator);
    I.see('Date uploaded [' + dateUploaded + ']', claimantDocumentsForDisclosureLocator);
  }

  verifyClaimantWitnessEvidenceSection(dateUploaded, claimType) {
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

    if (claimType === 'FastTrack') {
      const claimantIntentionToRelyHearsayEvidenceLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant intention to rely on hearsay evidence\')]]';
      I.see('Claimant intention to rely on hearsay evidence', claimantIntentionToRelyHearsayEvidenceLocator);
      I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness name 2 08-02-2023.tif\']', claimantIntentionToRelyHearsayEvidenceLocator);
      I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness name 1 07-02-2023.rtf\']', claimantIntentionToRelyHearsayEvidenceLocator);
      I.see('Date uploaded [' + dateUploaded + ']', claimantIntentionToRelyHearsayEvidenceLocator);
    }
  }

  verifyDefendantWitnessEvidenceSection(dateUploaded, claimType) {
    const docsReferredStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant documents referred to in statement\')]]';
    I.see('Defendant witness evidence', 'span');
    I.see('Defendant documents referred to in statement', docsReferredStatementLocator);
    I.seeElement('//a[.=\'Upper referred to in the statement of john 01-01-2023.pdf\']', docsReferredStatementLocator);
    I.see('Date uploaded [' + dateUploaded + ']', docsReferredStatementLocator);

    const witnessSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant witness summary\')]]';
    I.see('Defendant witness summary', witnessSummaryLocator);
    I.seeElement('//a[.=\'Witness Summary of Summary 23 01-01-2020.pdf\']', witnessSummaryLocator);
    I.see('Date uploaded [' + dateUploaded + ']', witnessSummaryLocator);

    const witnessStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant witness statement\')]]';
    I.see('Defendant witness statement', witnessStatementLocator);
    I.seeElement('//a[.=\'Witness Statement of Witness Name 01-03-2023.pdf\']', witnessStatementLocator);
    I.see('Date uploaded [' + dateUploaded + ']', witnessStatementLocator);

    if (claimType === 'FastTrack') {
      const intentionToRelyHearsayEvidenceLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant intention to rely on hearsay evidence\')]]';
      I.see('Defendant intention to rely on hearsay evidence', intentionToRelyHearsayEvidenceLocator);
      I.seeElement('//a[.=\'Hearsay evidence Notice of intention witness name 2 08-02-2023.tif\']', intentionToRelyHearsayEvidenceLocator);
      I.see('Date uploaded [' + dateUploaded + ']', intentionToRelyHearsayEvidenceLocator);
    }
  }

  verifyClaimantExpertEvidenceSection(dateUploaded, claimType, partyType) {
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

    if (claimType === 'FastTrack') {
      const claimantAnswersQuestionsAskedLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant answers to questions asked by other party\')]]';
      I.see('Claimant answers to questions asked by other party', claimantAnswersQuestionsAskedLocator);
      if (partyType === 'LiPvLiP'){
        I.seeElement('//a[.=\'Answers for Expert 2 Sir John Doe Answers for Expert Document Name 2.txt\']', claimantAnswersQuestionsAskedLocator);
        I.seeElement('//a[.=\'Answers for Expert 1 Sir John Doe Answers for Expert Document Name 1.txt\']', claimantAnswersQuestionsAskedLocator);
      } else {
        I.seeElement('//a[.=\'Ep Other party Question.pdf\']', claimantAnswersQuestionsAskedLocator);
      }
      I.see('Date uploaded [' + dateUploaded + ']', claimantAnswersQuestionsAskedLocator);

      const claimantQuestionsForOtherPartyLocator = '//div[@class=\'govuk-grid-column-one-half govuk-body\' and contains(text(), "Claimant questions for other party\'s expert or joint expert")]';
      I.see('Claimant questions for other party\'s expert or joint expert', claimantQuestionsForOtherPartyLocator);
      if (partyType === 'LiPvLiP'){
        I.seeElement('//a[.=\'Questions for Expert 2 Sir John Doe Questions for Expert Document Name 2.txt\']', claimantQuestionsForOtherPartyLocator);
        I.seeElement('//a[.=\'Questions for Expert 1 Sir John Doe Questions for Expert Document Name 1.jpeg\']', claimantQuestionsForOtherPartyLocator);
      } else {
        I.seeElement('//a[.=\'testing Party Document.pdf\']', claimantAnswersQuestionsAskedLocator);
      }
      I.see('Date uploaded [' + dateUploaded + ']', claimantQuestionsForOtherPartyLocator);
    }
  }

  verifyDefendantExpertEvidenceSection(dateUploaded, claimType) {
    I.see('Defendant expert evidence', 'span');
    const jointStatementLocator = '(//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Joint statement of experts\')]])[3]';
    I.see('Joint statement of experts', jointStatementLocator);
    I.seeElement('//a[.=\'Joint report Name Expertise 01-04-2023.pdf\']', jointStatementLocator);
    I.see('Date uploaded [' + dateUploaded + ']', jointStatementLocator);

    const expertReportLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant expert report\')]]';
    I.see('Defendant expert report', expertReportLocator);
    I.seeElement('//a[.=\'Experts report Name Expertise 02-03-2023.pdf\']', expertReportLocator);
    I.see('Date uploaded [' + dateUploaded + ']', expertReportLocator);

    if (claimType === 'FastTrack') {
      const claimantAnswersQuestionsAskedLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant answers to questions asked by other party\')]]';
      I.see('Defendant answers to questions asked by other party', claimantAnswersQuestionsAskedLocator);
      I.seeElement('//a[.=\'Ep Other party Question.pdf\']', claimantAnswersQuestionsAskedLocator);
      I.see('Date uploaded [' + dateUploaded + ']', claimantAnswersQuestionsAskedLocator);

      const claimantQuestionsForOtherPartyLocator = '//div[@class=\'govuk-grid-row\' and .//div[contains(text(), "Defendant questions for other party\'s expert or joint expert")]]\n';
      I.see('Defendant questions for other party\'s expert or joint expert', claimantQuestionsForOtherPartyLocator);
      I.seeElement('//a[.=\'testing Party Document.pdf\']', claimantQuestionsForOtherPartyLocator);
      I.see('Date uploaded [' + dateUploaded + ']', claimantQuestionsForOtherPartyLocator);
    }
  }

  verifyClaimantHearingDocumentsSection(dateUploaded, claimType) {
    if (claimType === 'FastTrack') {
      I.see('Claimant trial documents', 'span');
      const claimantCostsLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant costs\')]]';
      I.see('Claimant costs', claimantCostsLocator);
      I.seeElement('//a[.=\'TestTXT.txt\']', claimantCostsLocator);
      I.seeElement('//a[.=\'TestTXT.txt\']', claimantCostsLocator);
      I.see('Date uploaded [' + dateUploaded + ']', claimantCostsLocator);

      const claimantSkeletonArgumentLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant skeleton argument\')]]';
      I.see('Claimant skeleton argument', claimantSkeletonArgumentLocator);
      I.seeElement('//a[.=\'TestTXT.txt\']', claimantSkeletonArgumentLocator);
      I.seeElement('//a[.=\'TestTXT.txt\']', claimantSkeletonArgumentLocator);
      I.see('Date uploaded [' + dateUploaded + ']', claimantSkeletonArgumentLocator);

      const claimantCaseSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant case summary\')]]';
      I.see('Claimant case summary', claimantCaseSummaryLocator);
      I.seeElement('//a[.=\'TestTXT.txt\']', claimantCaseSummaryLocator);
      I.seeElement('//a[.=\'TestTXT.txt\']', claimantCaseSummaryLocator);
      I.see('Date uploaded [' + dateUploaded + ']', claimantCaseSummaryLocator);
    } else {
      I.see('Claimant hearing documents', 'span');
    }
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

  verifyDefendantHearingDocumentsSection(dateUploaded, claimType) {
    if (claimType === 'FastTrack') {
      I.see('Defendant trial documents', 'span');
      const costsLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant costs\')]]';
      I.see('Defendant costs', costsLocator);
      I.seeElement('//a[.=\'test.pdf\']', costsLocator);
      I.see('Date uploaded [' + dateUploaded + ']', costsLocator);

      const skeletonArgumentLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant skeleton argument\')]]';
      I.see('Defendant skeleton argument', skeletonArgumentLocator);
      I.seeElement('//a[.=\'test.pdf\']', skeletonArgumentLocator);
      I.see('Date uploaded [' + dateUploaded + ']', skeletonArgumentLocator);

      const caseSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant case summary\')]]';
      I.see('Defendant case summary', caseSummaryLocator);
      I.seeElement('//a[.=\'test.pdf\']', caseSummaryLocator);
      I.see('Date uploaded [' + dateUploaded + ']', caseSummaryLocator);
    } else {
      I.see('Defendant hearing documents', 'span');
    }
    const legalAuthoritiesLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant legal authorities\')]]';
    I.see('Defendant legal authorities', legalAuthoritiesLocator);
    I.seeElement('//a[.=\'test.pdf\']', legalAuthoritiesLocator);
    I.see('Date uploaded [' + dateUploaded + ']', legalAuthoritiesLocator);

    const documentaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant documentary evidence\')]]';
    I.see('Defendant documentary evidence', documentaryLocator);
    I.seeElement('//a[.=\'Documentary Evidence Deadline 01-02-2023.pdf\']', documentaryLocator);
    I.see('Date uploaded [' + dateUploaded + ']', documentaryLocator);
  }
}
module.exports = ViewDocuments;

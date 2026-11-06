const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewDocuments {

  async checkPageFullyLoaded() {
    await I.waitForElement('//a[contains(text(), "Close and return to case overview")]');
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount, dateUploaded, claimType) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText();
    if (claimType === 'FastTrack') {
      await this.verifyClaimantDisclosureSection(dateUploaded);
    }
    /*this.verifyClaimantWitnessEvidenceSection(dateUploaded, claimType);
    this.verifyDefendantWitnessEvidenceSection(dateUploaded, claimType);
    this.verifyClaimantExpertEvidenceSection(dateUploaded, claimType, partyType);
    this.verifyDefendantExpertEvidenceSection(dateUploaded, claimType);
    this.verifyClaimantHearingDocumentsSection(dateUploaded, claimType);
    this.verifyDefendantHearingDocumentsSection(dateUploaded, claimType);*/
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Home', 'li');
    await I.see('View documents', 'li');
  }

  async verifyHeadingDetails() {
    await I.see('Hearing', 'span');
    await I.see('View documents', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText() {
    await I.see('Read and save all documents uploaded by the parties involved in the claim. 10 days before the hearing, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
  }

  async verifyClaimantDisclosureSection(dateUploaded) {
    const disclosureListLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant disclosure list\')]]';
    await I.see('Claimant disclosure', 'span');
    await I.see('Claimant disclosure list', disclosureListLocator);
    await I.seeElement(`${disclosureListLocator}//a[normalize-space(.)='TestPDF.pdf']`);
    await I.seeElement(`${disclosureListLocator}//a[normalize-space(.)='TestDOCX.docx']`);
    await I.see('Date uploaded [' + dateUploaded + ']', disclosureListLocator);

    const claimantDocumentsForDisclosureLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant documents for disclosure\')]]';
    await I.see('Claimant documents for disclosure', claimantDocumentsForDisclosureLocator);
    await I.seeElement(
      `${claimantDocumentsForDisclosureLocator}//a[normalize-space(.)='Document for disclosure Test Data Entry for Document Disclosure 2 02-02-2023.doc']`
    );
    await I.seeElement(
      `${claimantDocumentsForDisclosureLocator}//a[normalize-space(.)='Document for disclosure Test Data Entry for Document Disclosure 1 01-02-2023.txt']`
    );
    await I.see('Date uploaded [' + dateUploaded + ']', claimantDocumentsForDisclosureLocator);
  }

  async verifyClaimantWitnessEvidenceSection(dateUploaded, claimType) {
    const docsReferredStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant documents referred to in statement\')]]';
    await I.see('Claimant witness evidence', 'span');
    await I.see('Claimant documents referred to in statement', docsReferredStatementLocator);
    await I.seeElement(`${docsReferredStatementLocator}//a[normalize-space(.)='Documents referred Type of Document 2 referred to in the statement of Documents referred witness name 2 06-02-2023.jpg']`);
    await I.seeElement(`${docsReferredStatementLocator}//a[normalize-space(.)='Documents referred Type of Document 1 referred to in the statement of Documents referred witness name 1 05-02-2023.jpeg']`);
    await I.see('Date uploaded [' + dateUploaded + ']', docsReferredStatementLocator);

    const witnessSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant witness summary\')]]';
    await I.see('Claimant witness summary', witnessSummaryLocator);
    await I.seeElement(`${witnessSummaryLocator}//a[normalize-space(.)='Witness Summary of Witness Summary - Witness Name 2 04-02-2023.docx']`);
    await I.seeElement(`${witnessSummaryLocator}//a[normalize-space(.)='Witness Summary of Witness Summary - Witness Name 1 03-02-2023.doc']`);
    await I.see('Date uploaded [' + dateUploaded + ']', witnessSummaryLocator);

    const witnessStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant witness statement\')]]';
    await I.see('Claimant witness statement', witnessStatementLocator);
    await I.seeElement(`${witnessStatementLocator}//a[normalize-space(.)='Witness Statement of Witness Statement - Witness Name 2 02-02-2023.csv']`);
    await I.seeElement(`${witnessStatementLocator}//a[normalize-space(.)='Witness Statement of Witness Statement - Witness Name 1 01-02-2023.bmp']`);
    await I.see('Date uploaded [' + dateUploaded + ']', witnessStatementLocator);

    if (claimType === 'FastTrack') {
      const claimantIntentionToRelyHearsayEvidenceLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant intention to rely on hearsay evidence\')]]';
      await I.see('Claimant intention to rely on hearsay evidence', claimantIntentionToRelyHearsayEvidenceLocator);
      await I.seeElement(`${claimantIntentionToRelyHearsayEvidenceLocator}//a[normalize-space(.)='Hearsay evidence Notice of intention witness name 2 08-02-2023.tif']`);
      await I.seeElement(`${claimantIntentionToRelyHearsayEvidenceLocator}//a[normalize-space(.)='Hearsay evidence Notice of intention witness name 1 07-02-2023.rtf']`);
      await I.see('Date uploaded [' + dateUploaded + ']', claimantIntentionToRelyHearsayEvidenceLocator);
    }
  }

  async verifyDefendantWitnessEvidenceSection(dateUploaded, claimType) {
    const docsReferredStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant documents referred to in statement\')]]';
    await I.see('Defendant witness evidence', 'span');
    await I.see('Defendant documents referred to in statement', docsReferredStatementLocator);
    await I.seeElement(`${docsReferredStatementLocator}//a[normalize-space(.)='Upper referred to in the statement of john 01-01-2023.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', docsReferredStatementLocator);

    const witnessSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant witness summary\')]]';
    await I.see('Defendant witness summary', witnessSummaryLocator);
    await I.seeElement(`${witnessSummaryLocator}//a[normalize-space(.)='Witness Summary of Summary 23 01-01-2020.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', witnessSummaryLocator);

    const witnessStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant witness statement\')]]';
    await I.see('Defendant witness statement', witnessStatementLocator);
    await I.seeElement(`${witnessStatementLocator}//a[normalize-space(.)='Witness Statement of Witness Name 01-03-2023.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', witnessStatementLocator);

    if (claimType === 'FastTrack') {
      const intentionToRelyHearsayEvidenceLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant intention to rely on hearsay evidence\')]]';
      await I.see('Defendant intention to rely on hearsay evidence', intentionToRelyHearsayEvidenceLocator);
      await I.seeElement(`${intentionToRelyHearsayEvidenceLocator}//a[normalize-space(.)='Hearsay evidence Notice of intention witness name 2 08-02-2023.tif']`);
      await I.see('Date uploaded [' + dateUploaded + ']', intentionToRelyHearsayEvidenceLocator);
    }
  }

  async verifyClaimantExpertEvidenceSection(dateUploaded, claimType, partyType) {
    await I.see('Claimant expert evidence', 'span');
    const jointStatementLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Joint statement of experts\')]]';
    await I.see('Joint statement of experts', jointStatementLocator);
    await I.seeElement(`${jointStatementLocator}//a[normalize-space(.)='Joint report Expert Statement - Expert Name 2 Expert Statement - Field Of Expertise 2 10-02-2023.rtf']`);
    await I.seeElement(`${jointStatementLocator}//a[normalize-space(.)='Joint report Expert Statement - Expert Name 1 Expert Statement - Field Of Expertise 1 09-02-2023.ppt']`);
    await I.see('Date uploaded [' + dateUploaded + ']', jointStatementLocator);

    const expertReportLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant expert report\')]]';
    await I.see('Claimant expert report', expertReportLocator);
    await I.seeElement(`${expertReportLocator}//a[normalize-space(.)='Experts report Expert Report - Expert Name 2 Expert Report - Field of Expertise 2 08-02-2023.png']`);
    await I.seeElement(`${expertReportLocator}//a[normalize-space(.)='Experts report Expert Report - Expert Name 1 Expert Report - Field of Expertise 1 07-02-2023.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', expertReportLocator);

    if (claimType === 'FastTrack') {
      const claimantAnswersQuestionsAskedLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant answers to questions asked by other party\')]]';
      await I.see('Claimant answers to questions asked by other party', claimantAnswersQuestionsAskedLocator);
      if (partyType === 'LiPvLiP'){
        await I.seeElement(`${claimantAnswersQuestionsAskedLocator}//a[normalize-space(.)='Answers for Expert 2 Sir John Doe Answers for Expert Document Name 2.txt']`);
        await I.seeElement(`${claimantAnswersQuestionsAskedLocator}//a[normalize-space(.)='Answers for Expert 1 Sir John Doe Answers for Expert Document Name 1.txt']`);
      } else {
        await I.seeElement(`${claimantAnswersQuestionsAskedLocator}//a[normalize-space(.)='Ep Other party Question.pdf']`);
      }
      await I.see('Date uploaded [' + dateUploaded + ']', claimantAnswersQuestionsAskedLocator);

      const claimantQuestionsForOtherPartyLocator = '//div[@class=\'govuk-grid-column-one-half govuk-body\' and contains(text(), "Claimant questions for other party\'s expert or joint expert")]';
      await I.see('Claimant questions for other party\'s expert or joint expert', claimantQuestionsForOtherPartyLocator);
      if (partyType === 'LiPvLiP'){
        await I.seeElement(`${claimantQuestionsForOtherPartyLocator}//a[normalize-space(.)='Questions for Expert 2 Sir John Doe Questions for Expert Document Name 2.txt']`);
        await I.seeElement(`${claimantQuestionsForOtherPartyLocator}//a[normalize-space(.)='Questions for Expert 1 Sir John Doe Questions for Expert Document Name 1.jpeg']`);
      } else {
        await I.seeElement(`${claimantAnswersQuestionsAskedLocator}//a[normalize-space(.)='testing Party Document.pdf']`);
      }
      await I.see('Date uploaded [' + dateUploaded + ']', claimantQuestionsForOtherPartyLocator);
    }
  }

  async verifyDefendantExpertEvidenceSection(dateUploaded, claimType) {
    await I.see('Defendant expert evidence', 'span');
    const jointStatementLocator = '(//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Joint statement of experts\')]])[3]';
    await I.see('Joint statement of experts', jointStatementLocator);
    await I.seeElement(`${jointStatementLocator}//a[normalize-space(.)='Joint report Name Expertise 01-04-2023.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', jointStatementLocator);

    const expertReportLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant expert report\')]]';
    await I.see('Defendant expert report', expertReportLocator);
    await I.seeElement(`${expertReportLocator}//a[normalize-space(.)='Experts report Name Expertise 02-03-2023.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', expertReportLocator);

    if (claimType === 'FastTrack') {
      const claimantAnswersQuestionsAskedLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant answers to questions asked by other party\')]]';
      await I.see('Defendant answers to questions asked by other party', claimantAnswersQuestionsAskedLocator);
      await I.seeElement(`${claimantAnswersQuestionsAskedLocator}//a[normalize-space(.)='Ep Other party Question.pdf']`);
      await I.see('Date uploaded [' + dateUploaded + ']', claimantAnswersQuestionsAskedLocator);

      const claimantQuestionsForOtherPartyLocator = '//div[@class=\'govuk-grid-row\' and .//div[contains(text(), "Defendant questions for other party\'s expert or joint expert")]]\n';
      await I.see('Defendant questions for other party\'s expert or joint expert', claimantQuestionsForOtherPartyLocator);
      await I.seeElement(`${claimantQuestionsForOtherPartyLocator}//a[normalize-space(.)='testing Party Document.pdf']`);
      await I.see('Date uploaded [' + dateUploaded + ']', claimantQuestionsForOtherPartyLocator);
    }
  }

  async verifyClaimantHearingDocumentsSection(dateUploaded, claimType) {
    if (claimType === 'FastTrack') {
      await I.see('Claimant trial documents', 'span');
      const claimantCostsLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant costs\')]]';
      await I.see('Claimant costs', claimantCostsLocator);
      await I.seeElement(`${claimantCostsLocator}//a[normalize-space(.)='TestTXT.txt']`);
      await I.see('Date uploaded [' + dateUploaded + ']', claimantCostsLocator);

      const claimantSkeletonArgumentLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant skeleton argument\')]]';
      await I.see('Claimant skeleton argument', claimantSkeletonArgumentLocator);
      await I.seeElement(`${claimantSkeletonArgumentLocator}//a[normalize-space(.)='TestTXT.txt']`);
      await I.see('Date uploaded [' + dateUploaded + ']', claimantSkeletonArgumentLocator);

      const claimantCaseSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant case summary\')]]';
      await I.see('Claimant case summary', claimantCaseSummaryLocator);
      await I.seeElement(`${claimantCaseSummaryLocator}//a[normalize-space(.)='TestTXT.txt']`);
      await I.see('Date uploaded [' + dateUploaded + ']', claimantCaseSummaryLocator);
    } else {
      await I.see('Claimant hearing documents', 'span');
    }
    const legalAuthoritiesLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant legal authorities\')]]';
    await I.see('Claimant legal authorities', legalAuthoritiesLocator);
    await I.seeElement(`${legalAuthoritiesLocator}//a[normalize-space(.)='TestXLSX.xlsx']`);
    await I.seeElement(`${legalAuthoritiesLocator}//a[normalize-space(.)='TestXLS.xls']`);
    await I.see('Date uploaded [' + dateUploaded + ']', legalAuthoritiesLocator);

    const documentaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Claimant documentary evidence\')]]';
    await I.see('Claimant documentary evidence', documentaryLocator);
    await I.seeElement(`${documentaryLocator}//a[normalize-space(.)='Documentary Evidence Documentary evidence for the hearing - Type of Document 2 12-02-2023.tiff']`);
    await I.seeElement(`${documentaryLocator}//a[normalize-space(.)='Documentary Evidence Documentary evidence for the hearing - Type of Document 1 11-02-2023.tif']`);
    await I.see('Date uploaded [' + dateUploaded + ']', documentaryLocator);
  }

  async verifyDefendantHearingDocumentsSection(dateUploaded, claimType) {
    if (claimType === 'FastTrack') {
      await I.see('Defendant trial documents', 'span');
      const costsLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant costs\')]]';
      await I.see('Defendant costs', costsLocator);
      await I.seeElement(`${costsLocator}//a[normalize-space(.)='test.pdf']`);
      await I.see('Date uploaded [' + dateUploaded + ']', costsLocator);

      const skeletonArgumentLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant skeleton argument\')]]';
      await I.see('Defendant skeleton argument', skeletonArgumentLocator);
      await I.seeElement(`${skeletonArgumentLocator}//a[normalize-space(.)='test.pdf']`);
      await I.see('Date uploaded [' + dateUploaded + ']', skeletonArgumentLocator);

      const caseSummaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant case summary\')]]';
      await I.see('Defendant case summary', caseSummaryLocator);
      await I.seeElement(`${caseSummaryLocator}//a[normalize-space(.)='test.pdf']`);
      await I.see('Date uploaded [' + dateUploaded + ']', caseSummaryLocator);
    } else {
      await I.see('Defendant hearing documents', 'span');
    }
    const legalAuthoritiesLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant legal authorities\')]]';
    await I.see('Defendant legal authorities', legalAuthoritiesLocator);
    await I.seeElement(`${legalAuthoritiesLocator}//a[normalize-space(.)='test.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', legalAuthoritiesLocator);

    const documentaryLocator = '//div[@class=\'govuk-grid-row\'][div[contains(text(), \'Defendant documentary evidence\')]]';
    await I.see('Defendant documentary evidence', documentaryLocator);
    await I.seeElement(`${documentaryLocator}//a[normalize-space(.)='Documentary Evidence Deadline 01-02-2023.pdf']`);
    await I.see('Date uploaded [' + dateUploaded + ']', documentaryLocator);
  }
}
module.exports = ViewDocuments;

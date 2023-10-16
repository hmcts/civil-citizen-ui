const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();

class UploadYourDocument {

  checkPageFullyLoaded() {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(claimType) {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyAcceptableDocumentsFormatsSectionContent();
    if (claimType === 'FastTrack') {
      this.verifyAllFastTrackSectionContent(claimType);
    } else if (claimType === 'SmallClaims') {
      this.verifyAllSmallClaimsSectionContent(claimType);
    }
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Upload documents', 'h1');
  }

  verifyAcceptableDocumentsFormatsSectionContent() {
    I.see('Acceptable documents formats', 'h2');
    I.see('Each document must be less than 100MB. You can upload the following file types: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.');
  }

  verifyAllFastTrackSectionContent(claimType) {
    this.verifyDisclosureSectionContent();
    this.verifyWitnessSectionContent(claimType);
    this.verifyExpertSectionContentForFastTrack();
    this.verifyTrialDocumentsSectionContent();
  }

  verifyAllSmallClaimsSectionContent(claimType) {
    this.verifyWitnessSectionContent(claimType);
    this.verifyExpertSectionContentForSmallClaims();
    this.verifyHearingDocumentsSectionContent();
  }

  verifyDisclosureSectionContent() {
    I.see('Disclosure', 'h2');
    I.see('Documents for disclosure', 'h3');
    I.see('Type of document');
    I.see('For example, contract, invoice, receipt, email, text message, photo, social media message');
    I.see('Date document was issued or message was sent');
    I.see('For example, 27 9 2022');
    I.see('Day');
    I.see('Month');
    I.see('Year');
    I.see('Upload a file');
    I.see('Disclosure list');
  }

  verifyWitnessSectionContent(claimType) {
    I.see('Witness evidence', 'h2');
    I.see('Witness statement', 'h3');
    I.see('Witness\'s name');
    I.see('Date statement was written');
    I.see('Witness summary');
    I.see('Witness\'s name');
    I.see('Date summary was written');
    if (claimType === 'FastTrack') {
      I.see('Notice of intention to rely on hearsay evidence');
    }
    I.see('Documents referred to in the statement');
    I.see('Date document was issued or message was sent');
  }

  verifyExpertSectionContentForFastTrack() {
    I.see('Expert evidence', 'h2');
    I.see('Expert\'s report', 'h3');
    I.see('Expert\'s name');
    I.see('Field of expertise');
    I.see('Date report was written');
    I.see('Joint statement of experts');
    I.see('Experts\' names');
    I.see('Field of expertise');
    I.see('Date statement was written');
    I.see('Questions for other party\'s expert or joint expert');
    I.see('Other party\'s name');
    I.see('Name of document you have questions about');
    I.see('Answers to questions asked by other party', 'h3');
    I.see('Name of document with other party\'s questions');
  }

  verifyExpertSectionContentForSmallClaims() {
    I.see('Expert evidence', 'h2');
    I.see('Expert\'s report', 'h3');
    I.see('Expert\'s name');
    I.see('Field of expertise');
    I.see('Date report was written');
    I.see('For example, 27 9 2022');
    I.see('Day');
    I.see('Month');
    I.see('Year');
    I.see('Upload a file');
    I.see('Joint statement of experts');
    I.see('Experts\' names');
    I.see('Field of expertise');
    I.see('Date statement was written');
  }

  verifyTrialDocumentsSectionContent() {
    I.see('Trial documents', 'h2');
    I.see('Case summary', 'h3');
    I.see('Skeleton argument', 'h3');
    I.see('Legal authorities', 'h3');
    I.see('Costs', 'h3');
    I.see('Documentary evidence for trial', 'h3');
  }

  verifyHearingDocumentsSectionContent() {
    I.see('Hearing documents', 'h2');
    I.see('Documentary evidence for the hearing', 'h3');
    I.see('Type of document');
    I.see('For example, contract, invoice, receipt, email, text message, photo, social media message');
    I.see('Date document was issued or message was sent');
    I.see('Legal authorities');
  }

  inputDataForFastTrackSections() {
    //Disclosure Section
    //Documents for disclosure - Subsection
    I.fillField('documentsForDisclosure[0][typeOfDocument]', 'Test Data Entry for Document Disclosure 1');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateDay]', '01');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsForDisclosure[0][fileUpload]', 'features/caseProgression/data/TestTXT.txt');
    I.click('[method=\'post\'] > .govuk-grid-column-two-thirds > div:nth-of-type(1) #add-another-disclosure-list');
    I.fillField('documentsForDisclosure[1][typeOfDocument]', 'Test Data Entry for Document Disclosure 2');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateDay]', '02');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsForDisclosure[1][fileUpload]', 'features/caseProgression/data/TestDOC.doc');

    //Disclosure list - Subsection
    I.attachFile('disclosureList[0][fileUpload]', 'features/caseProgression/data/TestDOCX.docx');
    I.click('[method=\'post\'] > .govuk-grid-column-two-thirds > div:nth-of-type(2) #add-another-disclosure-list');
    I.attachFile('disclosureList[1][fileUpload]', 'features/caseProgression/data/TestPDF.pdf');

    //Witness Section
    //Witness Statement - Subsection
    I.fillField('witnessStatement[0][witnessName]', 'Witness Statement - Witness Nae 1');
    I.fillField('witnessStatement[0][dateInputFields][dateDay]', '03');
    I.fillField('witnessStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[0][fileUpload]', 'features/caseProgression/data/TestXLS.xls');
    I.click('[method=\'post\'] div:nth-of-type(3) #add-another-witness-list');
    I.fillField('witnessStatement[1][witnessName]', 'Witness Statement - Witness Nae 2');
    I.fillField('witnessStatement[1][dateInputFields][dateDay]', '04');
    I.fillField('witnessStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[1][fileUpload]', 'features/caseProgression/data/TestXLSX.xlsx');

    //Witness Summary - Subsection
    I.fillField('witnessSummary[0][witnessName]', 'Witness Summary - Witness Nae 1');
    I.fillField('witnessSummary[0][dateInputFields][dateDay]', '05');
    I.fillField('witnessSummary[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[0][fileUpload]', 'features/caseProgression/data/TestPPT.ppt');
    I.click('[method=\'post\'] div:nth-of-type(4) #add-another-witness-list');
    I.fillField('witnessSummary[1][witnessName]', 'Witness Summary - Witness Nae 2');
    I.fillField('witnessSummary[1][dateInputFields][dateDay]', '06');
    I.fillField('witnessSummary[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[1][fileUpload]', 'features/caseProgression/data/TestPNG.png');

    //Notice of Intention - Subsection
    I.fillField('noticeOfIntention[0][witnessName]', 'Notice of intention witness nae 1');
    I.fillField('noticeOfIntention[0][dateInputFields][dateDay]', '07');
    I.fillField('noticeOfIntention[0][dateInputFields][dateMonth]', '02');
    I.fillField('noticeOfIntention[0][dateInputFields][dateYear]', '2023');
    I.attachFile('noticeOfIntention[0][fileUpload]', 'features/caseProgression/data/TestRTF.rtf');
    I.click('[method=\'post\'] div:nth-of-type(5) #add-another-witness-list');
    I.fillField('noticeOfIntention[1][witnessName]', 'Notice of intention witness nae 2');
    I.fillField('noticeOfIntention[1][dateInputFields][dateDay]', '08');
    I.fillField('noticeOfIntention[1][dateInputFields][dateMonth]', '02');
    I.fillField('noticeOfIntention[1][dateInputFields][dateYear]', '2023');
    I.attachFile('noticeOfIntention[1][fileUpload]', 'features/caseProgression/data/TestTIF.tif');

    //Docuents Referred to in the stateent - Subsection
    I.fillField('documentsReferred[0][typeOfDocument]', 'Docuents referred Type of Docuent 1');
    I.fillField('documentsReferred[0][dateInputFields][dateDay]', '09');
    I.fillField('documentsReferred[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[0][fileUpload]', 'features/caseProgression/data/TestTIFF.tiff');
    I.click('div:nth-of-type(6) #add-another-witness-list');
    I.fillField('documentsReferred[1][typeOfDocument]', 'Docuents referred Type of Docuent 2');
    I.fillField('documentsReferred[1][dateInputFields][dateDay]', '10');
    I.fillField('documentsReferred[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[1][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[1][fileUpload]', 'features/caseProgression/data/TestDOCX.docx');

    //Evidences Section
    //Expert's report - Subsection
    I.fillField('expertReport[0][expertName]', 'Expert Report - Expert Nae 1');
    I.fillField('expertReport[0][fieldOfExpertise]', 'Expert Report - Field of Expertise 1');
    I.fillField('expertReport[0][dateInputFields][dateDay]', '11');
    I.fillField('expertReport[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[0][fileUpload]', 'features/caseProgression/data/TestCSV.csv');
    I.click('div:nth-of-type(7) #add-another-expert-list');
    I.fillField('expertReport[1][expertName]', 'Expert Report - Expert Nae 2');
    I.fillField('expertReport[1][fieldOfExpertise]', 'Expert Report - Field of Expertise 2');
    I.fillField('expertReport[1][dateInputFields][dateDay]', '12');
    I.fillField('expertReport[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[1][fileUpload]', 'features/caseProgression/data/TestBMP.bmp');

    //Joint Stateent of Experts - Subsection
    I.fillField('expertStatement[0][expertName]', 'Expert Stateent - Expert Nae 1');
    I.fillField('expertStatement[0][fieldOfExpertise]', 'Expert Stateent - Field Of Expertise 1');
    I.fillField('expertStatement[0][dateInputFields][dateDay]', '13');
    I.fillField('expertStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[0][fileUpload]', 'features/caseProgression/data/TestPNG.png');
    I.click('div:nth-of-type(8) #add-another-expert-list');
    I.fillField('expertStatement[1][expertName]', 'Expert Stateent - Expert Nae 2');
    I.fillField('expertStatement[1][fieldOfExpertise]', 'Expert Stateent - Field Of Expertise 2');
    I.fillField('expertStatement[1][dateInputFields][dateDay]', '14');
    I.fillField('expertStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[1][fileUpload]', 'features/caseProgression/data/TestJPG.jpg');

    //Questions For Other Party - Subsection
    I.fillField('questionsForExperts[0][expertName]', 'Questions for Expert 1');
    I.selectOption('questionsForExperts[0][otherPartyName]', 'Test Inc');
    I.fillField('questionsForExperts[0][questionDocumentName]', 'Questions for Expert Docuent Nae 1');
    I.attachFile('questionsForExperts[0][fileUpload]', 'features/caseProgression/data/TestJPEG.jpeg');
    I.click('div:nth-of-type(9) #add-another-expert-list');
    I.fillField('questionsForExperts[1][expertName]', 'Questions for Expert 2');
    I.selectOption('questionsForExperts[1][otherPartyName]', 'Test Inc');
    I.fillField('questionsForExperts[1][questionDocumentName]', 'Questions for Expert Docuent Nae 2');
    I.attachFile('questionsForExperts[1][fileUpload]', 'features/caseProgression/data/TestTXT.txt');

    //Answers to Questions By Other Party - Subsection
    I.fillField('answersForExperts[0][expertName]', 'Answers for Expert 1');
    I.selectOption('answersForExperts[0][otherPartyName]', 'Test Inc');
    I.fillField('answersForExperts[0][otherPartyQuestionsDocumentName]', 'Answers for Expert Docuent Nae 1');
    I.attachFile('answersForExperts[0][fileUpload]', 'features/caseProgression/data/TestTXT.txt');
    I.click('div:nth-of-type(10) #add-another-expert-list');
    I.fillField('answersForExperts[1][expertName]', 'Answers for Expert 2');
    I.selectOption('answersForExperts[1][otherPartyName]', 'Test Inc');
    I.fillField('answersForExperts[1][otherPartyQuestionsDocumentName]', 'Answers for Expert Docuent Nae 2');
    I.attachFile('answersForExperts[1][fileUpload]', 'features/caseProgression/data/TestTXT.txt');

    //Trial Docuents - Section
    //Case Suary
    I.attachFile('trialCaseSummary[0][fileUpload]', 'features/caseProgression/data/TestTXT.txt');
    I.click('div:nth-of-type(11) #add-another-trial-list');
    I.attachFile('trialCaseSummary[1][fileUpload]', 'features/caseProgression/data/TestTXT.txt');

    //Skeleton
    I.attachFile('trialSkeletonArgument[0][fileUpload]', 'features/caseProgression/data/TestTXT.txt');
    I.click('div:nth-of-type(12) #add-another-trial-list');
    I.attachFile('trialSkeletonArgument[1][fileUpload]', 'features/caseProgression/data/TestTXT.txt');

    //Trial Authorities
    I.attachFile('trialAuthorities[0][fileUpload]', 'features/caseProgression/data/TestTXT.txt');
    I.click('div:nth-of-type(13) #add-another-trial-list');
    I.attachFile('trialAuthorities[1][fileUpload]', 'features/caseProgression/data/TestTXT.txt');

    //Costs
    I.attachFile('trialCosts[0][fileUpload]', 'features/caseProgression/data/TestTXT.txt');
    I.click('div:nth-of-type(14) #add-another-trial-list');
    I.attachFile('trialCosts[1][fileUpload]', 'features/caseProgression/data/TestTXT.txt');

    //Docuentary Evidence For Trial
    I.fillField('trialDocumentary[0][typeOfDocument]', 'Documentary evidence for trial - Type of Document 1');
    I.fillField('trialDocumentary[0][dateInputFields][dateDay]', '15');
    I.fillField('trialDocumentary[0][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[0][fileUpload]','features/caseProgression/data/TestTXT.txt');
    I.click('div:nth-of-type(15) #add-another-trial-list');
    I.fillField('trialDocumentary[1][typeOfDocument]', 'Documentary evidence for trial - Type of Document 2');
    I.fillField('trialDocumentary[1][dateInputFields][dateDay]', '15');
    I.fillField('trialDocumentary[1][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[1][fileUpload]','features/caseProgression/data/TestTXT.txt');
  }

  inputDataForSmallClaimsSections() {

    //Witness Section
    //Witness Statement - Subsection
    I.fillField('witnessStatement[0][witnessName]', 'Witness Statement - Witness Nae 1');
    I.fillField('witnessStatement[0][dateInputFields][dateDay]', '01');
    I.fillField('witnessStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[0][fileUpload]', 'features/caseProgression/data/TestBMP.bmp');
    I.click('[method=\'post\'] > .govuk-grid-column-two-thirds > div:nth-of-type(1) #add-another-witness-list');
    I.fillField('witnessStatement[1][witnessName]', 'Witness Statement - Witness Nae 2');
    I.fillField('witnessStatement[1][dateInputFields][dateDay]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[1][fileUpload]', 'features/caseProgression/data/TestCSV.csv');

    //Witness Summary - Subsection
    I.fillField('witnessSummary[0][witnessName]', 'Witness Summary - Witness Nae 1');
    I.fillField('witnessSummary[0][dateInputFields][dateDay]', '03');
    I.fillField('witnessSummary[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[0][fileUpload]', 'features/caseProgression/data/TestDOC.doc');
    I.click('[method=\'post\'] > .govuk-grid-column-two-thirds > div:nth-of-type(2) #add-another-witness-list');
    I.fillField('witnessSummary[1][witnessName]', 'Witness Summary - Witness Nae 2');
    I.fillField('witnessSummary[1][dateInputFields][dateDay]', '04');
    I.fillField('witnessSummary[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[1][fileUpload]', 'features/caseProgression/data/TestDOCX.docx');

    //Docuents Referred to in the stateent - Subsection
    I.fillField('documentsReferred[0][typeOfDocument]', 'Docuents referred Type of Docuent 1');
    I.fillField('documentsReferred[0][dateInputFields][dateDay]', '05');
    I.fillField('documentsReferred[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[0][fileUpload]', 'features/caseProgression/data/TestJPEG.jpeg');
    I.click('[method=\'post\'] div:nth-of-type(3) #add-another-witness-list');
    I.fillField('documentsReferred[1][typeOfDocument]', 'Docuents referred Type of Docuent 2');
    I.fillField('documentsReferred[1][dateInputFields][dateDay]', '06');
    I.fillField('documentsReferred[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[1][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[1][fileUpload]', 'features/caseProgression/data/TestJPG.jpg');

    //Evidences Section
    //Expert's report - Subsection
    I.fillField('expertReport[0][expertName]', 'Expert Report - Expert Nae 1');
    I.fillField('expertReport[0][fieldOfExpertise]', 'Expert Report - Field of Expertise 1');
    I.fillField('expertReport[0][dateInputFields][dateDay]', '07');
    I.fillField('expertReport[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[0][fileUpload]', 'features/caseProgression/data/TestPDF.pdf');
    I.click('[method=\'post\'] div:nth-of-type(4) #add-another-expert-list');
    I.fillField('expertReport[1][expertName]', 'Expert Report - Expert Nae 2');
    I.fillField('expertReport[1][fieldOfExpertise]', 'Expert Report - Field of Expertise 2');
    I.fillField('expertReport[1][dateInputFields][dateDay]', '08');
    I.fillField('expertReport[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[1][fileUpload]', 'features/caseProgression/data/TestPNG.png');

    //Joint Stateent of Experts - Subsection
    I.fillField('expertStatement[0][expertName]', 'Expert Stateent - Expert Nae 1');
    I.fillField('expertStatement[0][fieldOfExpertise]', 'Expert Stateent - Field Of Expertise 1');
    I.fillField('expertStatement[0][dateInputFields][dateDay]', '09');
    I.fillField('expertStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[0][fileUpload]', 'features/caseProgression/data/TestPPT.ppt');
    I.click('[method=\'post\'] div:nth-of-type(5) #add-another-expert-list');
    I.fillField('expertStatement[1][expertName]', 'Expert Stateent - Expert Nae 2');
    I.fillField('expertStatement[1][fieldOfExpertise]', 'Expert Stateent - Field Of Expertise 2');
    I.fillField('expertStatement[1][dateInputFields][dateDay]', '10');
    I.fillField('expertStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[1][fileUpload]', 'features/caseProgression/data/TestRTF.rtf');

    //Hearing Docuents Section
    //Docuentary Evidence For Trial - Subsection
    I.fillField('trialDocumentary[0][typeOfDocument]', 'Documentary evidence for the hearing - Type of Document 1');
    I.fillField('trialDocumentary[0][dateInputFields][dateDay]', '11');
    I.fillField('trialDocumentary[0][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[0][fileUpload]','features/caseProgression/data/TestTIF.tif');
    I.click('div:nth-of-type(6) #add-another-trial-list');
    I.fillField('trialDocumentary[1][typeOfDocument]', 'Documentary evidence for the hearing - Type of Document 2');
    I.fillField('trialDocumentary[1][dateInputFields][dateDay]', '12');
    I.fillField('trialDocumentary[1][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[1][fileUpload]','features/caseProgression/data/TestTIFF.tiff');

    //Trial Authorities - Subsection
    I.attachFile('trialAuthorities[0][fileUpload]', 'features/caseProgression/data/TestXLS.xls');
    I.click('div:nth-of-type(7) #add-another-trial-list');
    I.attachFile('trialAuthorities[1][fileUpload]', 'features/caseProgression/data/TestXLSX.xlsx');
  }
}

module.exports = UploadYourDocument;

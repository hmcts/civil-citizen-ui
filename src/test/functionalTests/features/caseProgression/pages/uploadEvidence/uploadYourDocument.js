const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();

class UploadYourDocument {

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(claimType) {
    if(claimType === 'FastTrack') {
      this.verifyHeadingDetails();
      this.verifyAcceptableDocumentsFormatsSectionContent();
      this.verifyDisclosureSectionContent();
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
    I.see('Witness evidence', 'h2');
    I.see('Witness statement', 'h3');
    I.see('Witness\'s name');
    I.see('Date statement was written');
    I.see('Witness summary');
    I.see('Witness\'s name');
    I.see('Date summary was written');
    I.see('Notice of intention to rely on hearsay evidence');
    I.see('Documents referred to in the statement');
    I.see('Date document was issued or message was sent');
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
    I.see('Trial documents', 'h2');
    I.see('Case summary', 'h3');
    I.see('Skeleton argument', 'h3');
    I.see('Legal authorities', 'h3');
    I.see('Costs', 'h3');
    I.see('Documentary evidence for trial', 'h3');
  }

  inputDataForAllSections() {
    //Disclosure Section
    //Documents for disclosure - Subsection
    I.fillField('documentsForDisclosure[0][typeOfDocument]', 'Test Data Entry for Document Disclosure 1');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateDay]', '01');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsForDisclosure[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('[method=\'post\'] > .govuk-grid-column-two-thirds > div:nth-of-type(1) #add-another-disclosure-list');
    I.fillField('documentsForDisclosure[1][typeOfDocument]', 'Test Data Entry for Document Disclosure 2');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateDay]', '02');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsForDisclosure[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Disclosure list - Subsection
    I.attachFile('disclosureList[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('[method=\'post\'] > .govuk-grid-column-two-thirds > div:nth-of-type(2) #add-another-disclosure-list');
    I.attachFile('disclosureList[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Witness Section
    //Witness Statement - Subsection
    I.fillField('witnessStatement[0][witnessName]', 'Witness Statement - Witness Nae 1');
    I.fillField('witnessStatement[0][dateInputFields][dateDay]', '03');
    I.fillField('witnessStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('[method=\'post\'] div:nth-of-type(3) #add-another-witness-list');
    I.fillField('witnessStatement[1][witnessName]', 'Witness Statement - Witness Nae 2');
    I.fillField('witnessStatement[1][dateInputFields][dateDay]', '04');
    I.fillField('witnessStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Witness Summary - Subsection
    I.fillField('witnessSummary[0][witnessName]', 'Witness Summary - Witness Nae 1');
    I.fillField('witnessSummary[0][dateInputFields][dateDay]', '05');
    I.fillField('witnessSummary[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('[method=\'post\'] div:nth-of-type(4) #add-another-witness-list');
    I.fillField('witnessSummary[1][witnessName]', 'Witness Summary - Witness Nae 2');
    I.fillField('witnessSummary[1][dateInputFields][dateDay]', '06');
    I.fillField('witnessSummary[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Notice of Intention - Subsection
    I.fillField('noticeOfIntention[0][witnessName]', 'Notice of intention witness nae 1');
    I.fillField('noticeOfIntention[0][dateInputFields][dateDay]', '07');
    I.fillField('noticeOfIntention[0][dateInputFields][dateMonth]', '02');
    I.fillField('noticeOfIntention[0][dateInputFields][dateYear]', '2023');
    I.attachFile('noticeOfIntention[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('[method=\'post\'] div:nth-of-type(5) #add-another-witness-list');
    I.fillField('noticeOfIntention[1][witnessName]', 'Notice of intention witness nae 2');
    I.fillField('noticeOfIntention[1][dateInputFields][dateDay]', '08');
    I.fillField('noticeOfIntention[1][dateInputFields][dateMonth]', '02');
    I.fillField('noticeOfIntention[1][dateInputFields][dateYear]', '2023');
    I.attachFile('noticeOfIntention[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Docuents Referred to in the stateent - Subsection
    I.fillField('documentsReferred[0][typeOfDocument]', 'Docuents referred Type of Docuent 1');
    I.fillField('documentsReferred[0][dateInputFields][dateDay]', '09');
    I.fillField('documentsReferred[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(6) #add-another-witness-list');
    I.fillField('documentsReferred[1][typeOfDocument]', 'Docuents referred Type of Docuent 2');
    I.fillField('documentsReferred[1][dateInputFields][dateDay]', '10');
    I.fillField('documentsReferred[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[1][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Evidences Section
    //Expert's report - Subsection
    I.fillField('expertReport[0][expertName]', 'Expert Report - Expert Nae 1');
    I.fillField('expertReport[0][fieldOfExpertise]', 'Expert Report - Field of Expertise 1');
    I.fillField('expertReport[0][dateInputFields][dateDay]', '11');
    I.fillField('expertReport[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(7) #add-another-expert-list');
    I.fillField('expertReport[1][expertName]', 'Expert Report - Expert Nae 2');
    I.fillField('expertReport[1][fieldOfExpertise]', 'Expert Report - Field of Expertise 2');
    I.fillField('expertReport[1][dateInputFields][dateDay]', '12');
    I.fillField('expertReport[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Joint Stateent of Experts - Subsection
    I.fillField('expertStatement[0][expertName]', 'Expert Stateent - Expert Nae 1');
    I.fillField('expertStatement[0][fieldOfExpertise]', 'Expert Stateent - Field Of Expertise 1');
    I.fillField('expertStatement[0][dateInputFields][dateDay]', '13');
    I.fillField('expertStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(8) #add-another-expert-list');
    I.fillField('expertStatement[1][expertName]', 'Expert Stateent - Expert Nae 2');
    I.fillField('expertStatement[1][fieldOfExpertise]', 'Expert Stateent - Field Of Expertise 2');
    I.fillField('expertStatement[1][dateInputFields][dateDay]', '14');
    I.fillField('expertStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Questions For Other Party - Subsection
    I.fillField('questionsForExperts[0][expertName]', 'Questions for Expert 1');
    I.selectOption('questionsForExperts[0][otherPartyName]', 'Test Inc');
    I.fillField('questionsForExperts[0][questionDocumentName]', 'Questions for Expert Docuent Nae 1');
    I.attachFile('questionsForExperts[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(9) #add-another-expert-list');
    I.fillField('questionsForExperts[1][expertName]', 'Questions for Expert 2');
    I.selectOption('questionsForExperts[1][otherPartyName]', 'Test Inc');
    I.fillField('questionsForExperts[1][questionDocumentName]', 'Questions for Expert Docuent Nae 2');
    I.attachFile('questionsForExperts[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Answers to Questions By Other Party - Subsection
    I.fillField('answersForExperts[0][expertName]', 'Answers for Expert 1');
    I.selectOption('answersForExperts[0][otherPartyName]', 'Test Inc');
    I.fillField('answersForExperts[0][otherPartyQuestionsDocumentName]', 'Answers for Expert Docuent Nae 1');
    I.attachFile('answersForExperts[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(10) #add-another-expert-list');
    I.fillField('answersForExperts[1][expertName]', 'Answers for Expert 2');
    I.selectOption('answersForExperts[1][otherPartyName]', 'Test Inc');
    I.fillField('answersForExperts[1][otherPartyQuestionsDocumentName]', 'Answers for Expert Docuent Nae 2');
    I.attachFile('answersForExperts[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Trial Docuents - Section
    //Case Suary
    I.attachFile('trialCaseSummary[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(11) #add-another-trial-list');
    I.attachFile('trialCaseSummary[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Skeleton
    I.attachFile('trialSkeletonArgument[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(12) #add-another-trial-list');
    I.attachFile('trialSkeletonArgument[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Trial Authorities
    I.attachFile('trialAuthorities[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(13) #add-another-trial-list');
    I.attachFile('trialAuthorities[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Costs
    I.attachFile('trialCosts[0][fileUpload]', 'features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(14) #add-another-trial-list');
    I.attachFile('trialCosts[1][fileUpload]', 'features/caseProgression/data/fileUpload.txt');

    //Docuentary Evidence For Trial
    I.fillField('trialDocumentary[0][typeOfDocument]', 'Documentary evidence for trial - Type of Document 1');
    I.fillField('trialDocumentary[0][dateInputFields][dateDay]', '15');
    I.fillField('trialDocumentary[0][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[0][fileUpload]','features/caseProgression/data/fileUpload.txt');
    I.click('div:nth-of-type(15) #add-another-trial-list');
    I.fillField('trialDocumentary[1][typeOfDocument]', 'Documentary evidence for trial - Type of Document 2');
    I.fillField('trialDocumentary[1][dateInputFields][dateDay]', '15');
    I.fillField('trialDocumentary[1][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[1][fileUpload]','features/caseProgression/data/fileUpload.txt');
  }

}

module.exports = UploadYourDocument;

const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();

class CheckYourAnswers {

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(claimType) {
    if(claimType === 'FastTrack') {
      this.verifyHeadingDetails();
      this.verifyDisclosureSectionContent();
      this.verifyWitnessSectionContent();
      this.verifyEvidenceSectionContent();
      this.verifyTrialDocuments();
      this.verifyConfirmationStatements();
    } else {

    }
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Check your answers', 'h1');
    I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
    I.see('Warning');
    I.see('You cannot withdraw a document once you have submitted it.');
  }

  verifyDisclosureSectionContent() {
    I.see('Disclosure', 'h1');
    I.see('Documents for disclosure 1');
    I.see('Type of document');
    I.see('Test Data Entry for Document Disclosure 1');
    I.see('Date document was issued or message was sent');
    I.see('1/2/2023');
    I.see('Document uploaded');
    I.see('fileUpload.txt');
    I.see('Documents for disclosure 2');
    I.see('Test Data Entry for Document Disclosure 2');
    I.see('2/2/2023');
  }

  verifyWitnessSectionContent() {
    I.see('Witness evidence', 'h1');
    I.see('Witness statement 1');
    I.see('Witness\'s name');
    I.see('Witness Statement - Witness Nae 1');
    I.see('Date statement was written');
    I.see('3/2/2023');
    I.see('Witness statement 2');
    I.see('Witness Statement - Witness Nae 2');
    I.see('4/2/2023');

    I.see('Witness summary 1');
    I.see('Date summary was written');
    I.see('Witness Summary - Witness Nae 1');
    I.see('5/2/2023');
    I.see('Witness summary 2');
    I.see('Witness Summary - Witness Nae 2');
    I.see('6/2/2023');

    I.see('Notice of intention to rely on hearsay evidence 1');
    I.see('Notice of intention witness nae 1');
    I.see('7/2/2023');
    I.see('Notice of intention to rely on hearsay evidence 2');
    I.see('Notice of intention witness nae 2');
    I.see('8/2/2023');

    I.see('Documents referred to in the statement 1');
    I.see('Docuents referred Type of Docuent 1');
    I.see('9/2/2023');
    I.see('Documents referred to in the statement 2');
    I.see('Docuents referred Type of Docuent 2');
    I.see('10/2/2023');
  }

  verifyEvidenceSectionContent() {
    I.see('Expert evidence', 'h1');
    I.see('Expert\'s report 1');
    I.see('Expert\'s name');
    I.see('Field of expertise');
    I.see('Expert Report - Field of Expertise 1');
    I.see('Date report was written');
    I.see('11/2/2023');
    I.see('Expert\'s report 2');
    I.see('Expert Report - Field of Expertise 2');
    I.see('12/2/2023');

    I.see('Joint statement of experts 1');
    I.see('Experts\' name');
    I.see('Expert Stateent - Expert Nae 1');
    I.see('Expert Stateent - Field Of Expertise 1');
    I.see('13/2/2023');
    I.see('Joint statement of experts 2');
    I.see('Expert Stateent - Expert Nae 2');
    I.see('Expert Stateent - Field Of Expertise 2');
    I.see('14/2/2023');

    I.see('Questions for other party\'s expert or joint expert 1');
    I.see('Questions for Expert 1');
    I.see('Other party\'s name');
    I.see('Test Inc');
    I.see('Name of document you have questions about');
    I.see('Questions for Expert Docuent Nae 1');

    I.see('Questions for other party\'s expert or joint expert 2');
    I.see('Questions for Expert 2');
    I.see('Questions for Expert Docuent Nae 2');

    I.see('Answers to questions asked by other party 1');
    I.see('Answers for Expert 1');
    I.see('Name of document with other party\'s questions');
    I.see('Answers to questions asked by other party 2');
    I.see('Answers for Expert 2');
    I.see('Answers for Expert Docuent Nae 2');
  }

  verifyTrialDocuments() {
    I.see('Trial documents', 'h1');
    I.see('Case summary 1');
    I.see('Case summary 2');
    I.see('Skeleton argument 1');
    I.see('Skeleton argument 2');
    I.see('Legal authorities 1');
    I.see('Legal authorities 2');
    I.see('Costs 1');
    I.see('Costs 2');
    I.see('Documentary evidence for trial 1');
    I.see('Documentary evidence for trial - Type of Document 1');
    I.see('Documentary evidence for trial 2');
    I.see('Documentary evidence for trial - Type of Document 2');
  }

  verifyConfirmationStatements() {
    I.see('Confirmation', 'h1');
    I.see('You cannot withdraw a document once you have submitted it.');
    I.see('I confirm the documents are correct, and understand that I cannot withdraw documents once I have submitted them.');

  }

  clickConfirm() {
    I.checkOption('#signed');
  }

}

module.exports = CheckYourAnswers;

const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class WhatTypeOfDocumentsDoYouWantToUpload {

  checkPageFullyLoaded () {
    I.seeElement('//a[.=\'Cancel\']');
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseType) {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    if (caseType === 'FastTrack') {
      this.verifyDisclosureSectionContent();
      this.verifyWitnessEvidenceSectionContent();
      this.verifyExpertEvidenceSectionContent(caseType);
      this.verifyTrialDocumentsSectionContent();
    } else if (caseType === 'SmallClaims') {
      this.verifyWitnessEvidenceSectionContent();
      this.verifyExpertEvidenceSectionContent(caseType);
      this.verifyHearingDocumentsSectionContent();
    }
    contactUs.verifyContactUs();
  }

  checkAllDocumentUploadOptions(claimType) {

    if (claimType === 'FastTrack') {

      //Disclosure Section
      I.checkOption('#documents');
      I.checkOption('#list');

      //Witness evidence Section
      I.checkOption('#witnessStatement');
      I.checkOption('#summary');
      I.checkOption('#witnessNotice');
      I.checkOption('#witnessDocuments');

      //Expert Evidence
      I.checkOption('#report');
      I.checkOption('#statement');
      I.checkOption('#questions');
      I.checkOption('#answer');

      //Trial documents
      I.checkOption('#case');
      I.checkOption('#skeleton');
      I.checkOption('#legal');
      I.checkOption('#cost');
      I.checkOption('#documentary');

    } else if (claimType === 'SmallClaims') {

      //Witness evidence Section
      I.checkOption('#witnessStatement');
      I.checkOption('#summary');
      I.checkOption('#witnessDocuments');

      //Expert Evidence
      I.checkOption('#report');
      I.checkOption('#statement');

      //Hearing Docuents
      I.checkOption('#documentary');
      I.checkOption('#legal');
    }

  }

  verifyHeadingDetails() {
    I.see('What types of documents do you want to upload?', 'h1');
    I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
    I.see('Select the types of documents that apply to your case. You may not need to upload documents for every category.');
  }

  verifyDisclosureSectionContent() {
    I.see('Disclosure');
    I.see('Documents for disclosure');
    I.see('Recorded information that you must show the other parties - for example, contracts, invoices, receipts, emails, text messages, photos, social media messages');
    I.see('Disclosure list');
    I.see('A list of the documents that you must show the other parties');
  }

  verifyWitnessEvidenceSectionContent(claimType) {
    I.see('Witness evidence');
    I.see('Witness statement');
    I.see('A written statement of what your witness wants to tell the court');
    I.see('Witness summary');
    I.see('If you cannot get a written statement from your witness, you can write a summary of the evidence you would want to include in the witness statement. You must apply to the court to use a witness summary at the hearing. You must do this before the deadline. Use');
    if (claimType === 'FastTrack') {
      I.see('Notice of intention to rely on hearsay evidence');
      I.see('Notice to tell the other parties that you intend to rely on hearsay evidence at the trail. If the evidence is in a witness statement and the witness is not going to be in court, you must say why');
    }
    I.see('Documents referred to in the statement');
    I.see('Documents you or your witness refer to in the statement, including emails, receipts, invoices, contracts and photos');
  }

  verifyExpertEvidenceSectionContent(claimType) {
    I.see('Expert evidence');
    I.see('Expert\'s report');
    I.see('A written report by your expert. Expert evidence is an opinion based on the expertise of a specialist, for example - a building surveyor who can comment on the quality of building work. An expert is not a legal representative');
    I.see('Joint statement of experts');
    I.see('A statement by the experts for both parties, setting out the facts in the case that they agree on or disagree on. This only applies if you and the other party set up a meeting for your experts. The experts write this statement after their discussion');
    if (claimType === 'FastTrack') {
      I.see('Questions for other party\'s expert or joint expert');
      I.see('Written questions about an expert\'s report or a joint statement of experts');
      I.see('Answers to questions asked by other party');
      I.see('Your expert\'s answers to questions put by the other party');
    }
  }

  verifyTrialDocumentsSectionContent() {
    I.see('Case summary');
    I.see('Overview of your whole case');
    I.see('Skeleton argument');
    I.see('Summary of the case, the areas in dispute and the reasons why you think those disputes should be resolved in your favour');
    I.see('Legal authorities');
    I.see('You can use legal authorities to support your case. These are Acts of Parliament, Rules - for example, the Civil Procedure Rules - or other court cases that have decided a point that is relevant to your case. Copy and paste the relevant extracts from Acts, Rules or cases into a document to upload');
    I.see('Costs');
    I.see('A detailed list of the costs you have incurred in making or defending the claim, for example photocopying, getting copies of contracts, include receipts');
    I.see('Documentary evidence for trial');
    I.see('Documents that you wish to rely on at the trial, including emails, receipts, invoices, contracts and photos. You do not need to add documents that you have already added under witness evidence');
  }

  verifyHearingDocumentsSectionContent() {
    I.see('Documentary evidence for the hearing');
    I.see('Documents that you wish to rely on at the hearing, including emails, receipts, invoices, contracts and photos. You do not need to add documents that you have already added under witness evidence');
    I.see('Legal authorities');
    I.see('You can use legal authorities to support your case. These are Acts of Parliament, Rules - for example, the Civil Procedure Rules - or other court cases that have decided a point that is relevant to your case. Copy and paste the relevant extracts from Acts, Rules or cases into a document to upload');
  }

}

module.exports = WhatTypeOfDocumentsDoYouWantToUpload;

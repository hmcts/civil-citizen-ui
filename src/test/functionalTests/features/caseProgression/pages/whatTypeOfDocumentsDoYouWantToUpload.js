const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class WhatTypeOfDocumentsDoYouWantToUpload {

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.verifyHeadingDetails();
    this.verifyDisclosureSectionContent();
    this.verifyWitnessEvidenceSectionContent();
    this.verifyExpertEvidenceSectionContent();
    this.verifyTrialDocumentsSectionContent();
    contactUs.verifyContactUs();
  }

  checkAllDocumentUploadOptions() {

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

  verifyWitnessEvidenceSectionContent() {
    I.see('Witness evidence');
    I.see('Witness statement');
    I.see('A written statement of what your witness wants to tell the court');
    I.see('Witness summary');
    I.see('If you cannot get a written statement from your witness, you can write a summary of the evidence you would want to include in the witness statement. You must apply to the court to use a witness summary at the hearing. You must do this before the deadline. Use');
    I.see('Notice of intention to rely on hearsay evidence');
    I.see('Notice to tell the other parties that you intend to rely on hearsay evidence at the trail. If the evidence is in a witness statement and the witness is not going to be in court, you must say why');
    I.see('Documents referred to in the statement');
    I.see('Documents you or your witness refer to in the statement, including emails, receipts, invoices, contracts and photos');
  }

  verifyExpertEvidenceSectionContent() {
    I.see('Expert evidence');
    I.see('Expert\'s report');
    //I.see('TODO -- Wrong Content TO BE FIXED');
    I.see('Joint statement of experts');
    //I.see('TODO -- Wrong Content TO BE FIXED');
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

}

module.exports = WhatTypeOfDocumentsDoYouWantToUpload;

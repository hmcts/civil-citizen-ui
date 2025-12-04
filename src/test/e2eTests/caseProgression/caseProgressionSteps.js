const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {seeInTitle} = require('../commons/seeInTitle');
const {seeBackLink} = require('../commons/seeBackLink');
const {seeBreadcrumbs} = require('../commons/seeBreadcrumbs');
const I = actor();

class CaseProgressionSteps {
  start(claimId) {
    I.amOnPage(`case/${claimId}/case-progression/upload-your-documents`);
    seeInTitle('Upload your documents');
    seeBreadcrumbs();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Upload your documents', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0001', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');
    I.see('Check the order the court sent you for what documents you need to upload for your case.', 'p.govuk-body');
    I.see('You cannot withdraw a document once you have submitted it. If you want to add more information to something you have already submitted, you can upload the document again. You should add a version number to the name, for example \'version2\'.', 'p.govuk-body');
    I.see('The other parties will be able to see the documents you have uploaded, and you will be able to see their documents.', 'p.govuk-body');

    I.see('Deadlines for uploading documents', 'h2.govuk-heading-m ');
    I.see('Check the order the court sent you for the deadlines for uploading your documents.', 'p.govuk-body');
    I.see('After the deadline, you will have to', 'p.govuk-body');
    I.see('apply to the court', 'a.govuk-link');
    I.see('if you want any new document to be used at the trial or hearing.', 'p.govuk-body');
    I.see('You do not have to upload all your documents at once. You can return to upload them later.', 'p.govuk-body');

    I.see('Before you upload your documents', 'h2.govuk-heading-m ');
    I.see('Before you upload the document, give it a name that tells the court what it is, for example \'Witness statement by Jane Smith\'.', 'p.govuk-body');
    I.see('Each document must be less than 100MB. You can upload the following file types: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.', 'p.govuk-body');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.START_NOW);

  }

  typeOfDocument() {
    I.seeInCurrentUrl('/case-progression/type-of-documents');

    seeInTitle('What types of documents do you want to upload?');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('What types of documents do you want to upload?', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0001', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');

    I.see('Select the types of documents that apply to your case. You may not need to upload documents for every category.', 'p.govuk-body');

    I.see('Witness evidence', 'legend.govuk-fieldset__legend');
    I.see('Witness statement', 'label.govuk-label');
    I.see('A written statement of what your witness wants to tell the court', 'div.govuk-hint');

    I.see('Witness summary', 'label.govuk-label');
    I.see('If you cannot get a written statement from your witness, you can write a summary of the evidence you would want to include in the witness statement. You must apply to the court to use a witness summary at the hearing. You must do this before the deadline. Use', 'div.govuk-hint');
    I.see('form N244 \'application notice', 'a');

    I.see('Documents referred to in the statement', 'label.govuk-label');
    I.see('Documents you or your witness refer to in the statement, including emails, receipts, invoices, contracts and photos', 'div.govuk-hint');

    I.see('Expert evidence', 'legend.govuk-fieldset__legend');
    I.see('Expert\'s report', 'label.govuk-label');
    I.see('A written report by your expert. Expert evidence is an opinion based on the expertise of a specialist, for example - a building surveyor who can comment on the quality of building work. An expert is not a legal representative', 'div.govuk-hint');

    I.see('Joint statement of experts', 'label.govuk-label');
    I.see('A statement by the experts for both parties, setting out the facts in the case that they agree on or disagree on. This only applies if you and the other party set up a meeting for your experts. The experts write this statement after their discussion', 'div.govuk-hint');

    I.see('Hearing documents', 'legend.govuk-fieldset__legend');
    I.see('Documentary evidence for the hearing', 'label.govuk-label');
    I.see('Documents that you wish to rely on at the hearing, including emails, receipts, invoices, contracts and photos. You do not need to add documents that you have already added under witness evidence', 'div.govuk-hint');

    I.see('Legal authorities', 'label.govuk-label');
    I.see('You can use legal authorities to support your case. These are Acts of Parliament, Rules - for example, the Civil Procedure Rules - or other court cases that have decided a point that is relevant to your case. Copy and paste the relevant extracts from Acts, Rules or cases into a document to upload', 'div.govuk-hint');

    I.checkOption('#witnessStatement');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);
  }

  uploadDocuments() {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    I.seeInCurrentUrl('/case-progression/upload-documents');

    seeInTitle('List your evidence');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Upload documents', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0001', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');

    I.see('Acceptable documents formats', 'h2.govuk-heading-s');
    I.see('Each document must be less than 100MB. You can upload the following file types: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.', 'p.govuk-body-m');

    I.see('Witness evidence', 'h2.govuk-heading-l');
    I.see('Witness statement', 'h2.govuk-heading-s');
    I.see('Witness\'s name', 'strong');
    I.fillField('witnessStatement[0][witnessName]', 'test');

    I.see('Date statement was written', 'legend.govuk-fieldset__legend');
    I.see('For example, 27 9 2022', 'div.govuk-hint');
    I.fillField('witnessStatement[0][dateInputFields][dateDay]', '01');
    I.fillField('witnessStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOC.doc');
    I.click('(//*[@value="witnessStatement[0][uploadButton]"])');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);

  }

  checkAndSend() {
    I.seeInCurrentUrl('/case-progression/check-and-send');

    seeInTitle('Check your answers');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Check your answers', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0001', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');

    I.seeElement('div.govuk-inset-text');

    I.see('Witness evidence', 'h2.govuk-heading-l');
    I.see('Witness statement', 'dt.govuk-summary-list__key');
    I.see('Witness\'s name', 'dd.govuk-summary-list__value');
    I.see('test', 'dd.govuk-summary-list__value');

    I.see('Date statement was written', 'dd.govuk-summary-list__value');

    I.see('1/2/2023', 'dd.govuk-summary-list__value');
    I.see('Document uploaded', 'dd.govuk-summary-list__value');
    I.see('name', 'dd.govuk-summary-list__value a.govuk-link');

    I.see('Confirmation', 'h1.govuk-heading-l');
    I.seeElement('div.govuk-warning-text');

    I.see('I confirm the documents are correct and understand that I cannot withdraw documents once I have submitted them.', 'label.govuk-label');
    I.checkOption('#signed');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.SUBMIT);
    I.seeInCurrentUrl('/case-progression/documents-uploaded');
  }

}

module.exports = new CaseProgressionSteps();

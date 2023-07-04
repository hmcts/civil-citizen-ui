const ContactUs = require('../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();
//const stringUtils = new StringUtilsComponent();

class UploadYourDocument {

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.verifyHeadingDetails();
    this.verifyAcceptableDocumentsFormatsSectionContent();
    this.verifyDisclosureSectionContent();
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
    I.see('Witness evidence','h2');
    I.see('Witness statement','h3');
    I.see('Witness\'s name');
    I.see('Date statement was written');
    I.see('Witness summary');
    I.see('Witness\'s name');
    I.see('Date summary was written');
    I.see('Notice of intention to rely on hearsay evidence');
    I.see('Documents referred to in the statement');
    I.see('Date document was issued or message was sent');
    I.see('Expert evidence','h2');
    I.see('Expert\'s report','h3');
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
    I.see('Answers to questions asked by other party','h3');
    I.see('Name of document with other party\'s questions');
    I.see('Trial documents','h2');
    I.see('Case summary','h3');
    I.see('Skeleton argument','h3');
    I.see('Legal authorities','h3');
    I.see('Costs','h3');
    I.see('Documentary evidence for trial','h3');
  }

}

module.exports = UploadYourDocument;

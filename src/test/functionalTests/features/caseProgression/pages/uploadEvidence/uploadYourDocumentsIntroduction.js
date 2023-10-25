const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();
//const stringUtils = new StringUtilsComponent();

class UploadYourDocumentsIntroduction {

  checkPageFullyLoaded () {
    I.waitForElement('//a[contains(.,\'Start now\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyUploadDocumentSectionContent();
    this.verifyDeadlinesForUploadingDocumentsContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Upload your documents', 'h1');
    I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
  }

  verifyUploadDocumentSectionContent() {
    I.see('Check the order the court sent you for what documents you need to upload for your case.');
    I.see('You cannot withdraw a document once you have submitted it. If you want to add more information to something you have already submitted, you can upload the document again. You should add a version number to the name, for example \'version2\'.');
    I.see('The other parties will be able to see the documents you have uploaded, and you will be able to see their documents.');
  }

  verifyDeadlinesForUploadingDocumentsContent() {
    I.see('Deadlines for uploading documents','h3');
    I.see('Check the order the court sent you for the deadlines for uploading your documents.');
    I.see('After the deadline, you will have to');
    I.seeElement('//a[contains(.,\'apply to the court\')]');
    I.see('if you want any new document to be used at the trial or hearing.');
    I.see('You do not have to upload all your documents at once. You can return to upload them later.');
  }

  verifyBeforeYouUploadYourDocumentsContent() {
    I.see('Before you upload your documents','h3');
    I.see('Before you upload the document, give it a name that tells the court what it is, for example \'Witness statement by Jane Smith\'.');
    I.see('Each document must be less than 100MB. You can upload the following file types: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.');
  }
}

module.exports = UploadYourDocumentsIntroduction;

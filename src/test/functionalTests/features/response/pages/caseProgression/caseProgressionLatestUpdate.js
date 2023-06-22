const ContactUs = require("../common/contactUs");
const I = actor();

const contactUs = new ContactUs();

class CaseProgressionLatestUpdate {

  open(claimRef, nextAction) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyLatestUpdatePageContent();
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent() {
    this.verifyHeadingDetails();
    this.verifyHearingNoticeSectionContent();
    this.verifyUploadDocumentSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Test Inc v Sir John Doe', 'h1');
    I.see('Claim number: ');
    I.see('Latest update');
    I.see('Documents');
  }

  verifyHearingNoticeSectionContent() {
    I.see('A trial has been scheduled for your case', 'h3');
    //TODO - Include the hearing date in the relevant Format
    I.see('Your trial has been scheduled for');
    I.see('at Central London County Court.');
  }

  verifyUploadDocumentSectionContent() {
    I.see('Upload documents', 'h3');
    I.see('Due by:');
    I.see('You can upload and submit any documents which support your claim. These can include any communications, paperwork and statements from expert and witnesses.');
    I.see('Please follow the instructions sent in the');
    I.seeElement('//a[contains(.,\'standard directions order\')]');
    I.see('which can be found under \'Notices and orders\'.');
    I.see('Any documents submitted after the due date may not be considered by the judge.');
  }
}

module.exports = CaseProgressionLatestUpdate;

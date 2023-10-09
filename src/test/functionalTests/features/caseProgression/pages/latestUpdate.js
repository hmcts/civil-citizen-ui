const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class LatestUpdate {

  open(claimRef, claimType, hearingInitiatedFlag = true, orderCreatedFlag = false) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyLatestUpdatePageContent(claimType, hearingInitiatedFlag, orderCreatedFlag);
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent(claimType, hearingInitiatedFlag) {
    this.verifyHeadingDetails();
    if (hearingInitiatedFlag === true) {
      this.verifyHearingOrTrialNoticeSectionContent(claimType);
    }
    this.verifyUploadDocumentTileContent(hearingInitiatedFlag);
    this.verifyOrderCreatedTileContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Test Inc v Sir John Doe', 'h1');
    I.see('Claim number: ');
    I.see('Updates');
    I.see('Notices and orders');
    I.see('Documents');
  }

  verifyHearingOrTrialNoticeSectionContent(claimType) {
    //TODO - Include the hearing date in the relevant Format
    if (claimType === 'FastTrack') {
      I.see('A trial has been scheduled for your case', 'h3');
      I.see('Your trial has been scheduled for');
    } else {
      I.see('A hearing has been scheduled for your case', 'h3');
      I.see('Your hearing has been scheduled for');
    }
    I.see('at Central London County Court.');
  }

  verifyUploadDocumentTileContent(hearingInitiatedFlag) {
    I.see('Upload documents', 'h3');
    if (hearingInitiatedFlag) {
      I.see('Due by:');
    } else {
      I.dontSee('Due by:');
    }
    I.see('You can upload and submit any documents which support your claim. These can include any communications, paperwork and statements from expert and witnesses.');
    I.see('Please follow the instructions sent in the');
    I.seeElement('//a[contains(.,\'standard directions order\')]');
    I.see('which can be found under \'Notices and orders\'.');
    I.see('Any documents submitted after the due date may not be considered by the judge.');
  }

  verifyOrderCreatedTileContent() {
    I.see('An order has been made on your claim','h3');
    I.see('The Judge has made an order on your claim.');
    I.see('The order is available in \'Notices and orders\'.');
  }
}

module.exports = LatestUpdate;

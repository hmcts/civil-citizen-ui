const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class LatestUpdate {

  open(claimRef, claimType, hearingInitiatedFlag = true, orderCreatedFlag = false, trialArrangementFlag = false, otherPartyTrialArrangementFlag = false, caseStruckOutFlag = false, bundleFlag= false ) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyLatestUpdatePageContent(claimType, hearingInitiatedFlag, orderCreatedFlag, trialArrangementFlag, otherPartyTrialArrangementFlag, caseStruckOutFlag, bundleFlag);
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent(claimType, hearingInitiatedFlag, orderCreatedFlag, trialArrangementFlag, otherPartyTrialArrangementFlag, caseStruckOutFlag, bundleFlag) {
    this.verifyHeadingDetails();
    if (hearingInitiatedFlag === true) {
      this.verifyHearingOrTrialNoticeSectionContent(claimType);
    }
    if (trialArrangementFlag === true) {
      this.verifyTrialArrangeentTileContent();
    }
    if(orderCreatedFlag === true) {
      this.verifyOrderCreatedTileContent();
    }
    if (otherPartyTrialArrangementFlag === true) {
      this.verifyOtherPartyTrialArrangementTileContent();
    }
    if (caseStruckOutFlag === true) {
      this.verifyCaseStruckOutTile();
    } else {
      this.verifyUploadDocumentTileContent(hearingInitiatedFlag);
    }
    if (bundleFlag === true) {
      this.verifyBundleTileContent();
    }
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.waitForContent('Test Inc v Sir John Doe', 60);
    I.see('Claim number: ');
    I.see('Updates');
    I.see('Notices and orders');
    I.see('Documents');
  }
  verifyTrialArrangementsFinalisedTile() {
    I.waitForContent('You have finalised your trial arrangements', 60);
    I.see('You can view your trial arrangements under \'Notices and orders\'.');
  }

  verifyCaseStruckOutTile() {
    I.waitForContent('Claim has been struck out', 60);
    I.see('This claim has been struck out because the claimant has not paid the hearing fee as instructed in the hearing notice. As a result, the hearing scheduled for 10 November 2023 at 09:30 will no longer take place.');
    I.see('If the claimant wants to reinstate this claim, they will need to make an application to the court.');
  }

  verifyTrialArrangementsTile(claimType) {
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
    I.see('Please keep your contact details and the contact details of anyone you wish to rely on in court up to date. ');
    I.see('You can update contact details by telephoning the court at 0300 123 7050.');
    I.see('You should view the hearing notice under');
    I.seeElement('//a[.=\'Notices and Orders\']');
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

  verifyTrialArrangeentTileContent() {
    I.see('Finalise your trial arrangements for your upcoming trial','h3');
    I.see('Due by:');
    I.see('If there are changes to your trial arrangements, you should let us know by midnight,');
    I.see('You may wish to review the original directions you supplied in the');
    I.seeElement('//a[.=\'directions questionnaire\']');
    I.see('under ‘Notices and orders’ prior to finalising your trial arrangements.');
  }

  verifyOtherPartyTrialArrangementTileContent() {
    I.see('The other party has finalised their trial arrangements','h3');
    I.see('You can view the other party\'s trial arrangements under \'Notices and orders\'.');
  }

  verifyBundleTileContent() {
    I.wait(2);
    I.refreshPage();
    I.see('Bundle is complete and ready to view','h3');
    I.see('The bundle contains all the documents submitted by both parties.');
    I.see('Please review the bundle to makes sure all the information is correct.');
    I.see('You are reminded that the other party will also be able to view the bundle.');
  }
}

module.exports = LatestUpdate;

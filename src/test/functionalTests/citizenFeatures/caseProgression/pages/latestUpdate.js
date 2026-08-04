const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class LatestUpdate {

  async open(claimRef, claimType, hearingInitiatedFlag = true, orderCreatedFlag = false, trialArrangementFlag = false, otherPartyTrialArrangementFlag = false, caseStruckOutFlag = false, bundleFlag= false ) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await this.verifyLatestUpdatePageContent(claimType, hearingInitiatedFlag, orderCreatedFlag, trialArrangementFlag, otherPartyTrialArrangementFlag, caseStruckOutFlag, bundleFlag);
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyLatestUpdatePageContent(claimType, hearingInitiatedFlag, orderCreatedFlag, trialArrangementFlag, otherPartyTrialArrangementFlag, caseStruckOutFlag, bundleFlag) {
    await this.verifyHeadingDetails();
    if (hearingInitiatedFlag === true) {
      await this.verifyHearingOrTrialNoticeSectionContent(claimType);
    }
    if (trialArrangementFlag === true) {
      await this.verifyTrialArrangeentTileContent();
    }
    if(orderCreatedFlag === true) {
      await this.verifyOrderCreatedTileContent();
    }
    if (otherPartyTrialArrangementFlag === true) {
      await this.verifyOtherPartyTrialArrangementTileContent();
    }
    if (caseStruckOutFlag === true) {
      await this.verifyCaseStruckOutTile();
    } else {
      await this.verifyUploadDocumentTileContent(hearingInitiatedFlag);
    }
    if (bundleFlag === true) {
      await this.verifyBundleTileContent();
    }
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.waitForContent('Test Inc v Sir John Doe', 60);
    await I.see('Claim number: ');
    await I.see('Updates');
    await I.see('Notices and orders');
    await I.see('Documents');
  }
  async verifyTrialArrangementsFinalisedTile() {
    await I.waitForContent('You have finalised your trial arrangements', 60);
    await I.see('You can view your trial arrangements under \'Notices and orders\'.');
  }

  async verifyCaseStruckOutTile() {
    await I.waitForContent('Claim has been struck out', 60);
    await I.see('This claim has been struck out because the claimant has not paid the hearing fee as instructed in the hearing notice. As a result, the hearing scheduled for 10 November 2023 at 09:30 will no longer take place.');
    await I.see('If the claimant wants to reinstate this claim, they will need to make an application to the court.');
  }

  async verifyTrialArrangementsTile(claimType) {
    //TODO - Include the hearing date in the relevant Format
    if (claimType === 'FastTrack') {
      await I.see('A trial has been scheduled for your case', 'h3');
      await I.see('Your trial has been scheduled for');
    } else {
      await I.see('A hearing has been scheduled for your case', 'h3');
      await I.see('Your hearing has been scheduled for');
    }
    await I.see('at Central London County Court.');
  }

  async verifyHearingOrTrialNoticeSectionContent(claimType) {
    //TODO - Include the hearing date in the relevant Format
    if (claimType === 'FastTrack') {
      await I.see('A trial has been scheduled for your case', 'h3');
      await I.see('Your trial has been scheduled for');
    } else {
      await I.see('A hearing has been scheduled for your case', 'h3');
      await I.see('Your hearing has been scheduled for');
    }
    await I.see('at Central London County Court.');
    await I.see('Please keep your contact details and the contact details of anyone you wish to rely on in court up to date. ');
    await I.see('You can update contact details by telephoning the court at 0300 123 7050.');
    await I.see('You should view the hearing notice under');
    await I.seeElement('//a[.=\'Notices and Orders\']');
  }

  async verifyUploadDocumentTileContent(hearingInitiatedFlag) {
    await I.see('Upload documents', 'h3');
    if (hearingInitiatedFlag) {
      await I.see('Due by:');
    } else {
      await I.dontSee('Due by:');
    }
    await I.see('You can upload and submit any documents which support your claim. These can include any communications, paperwork and statements from expert and witnesses.');
    await I.see('Please follow the instructions sent in the');
    await I.seeElement('//a[contains(.,\'standard directions order\')]');
    await I.see('which can be found under \'Notices and orders\'.');
    await I.see('Any documents submitted after the due date may not be considered by the judge.');
  }

  async verifyOrderCreatedTileContent() {
    await I.see('An order has been made on your claim','h3');
    await I.see('The Judge has made an order on your claim.');
    await I.see('The order is available in \'Notices and orders\'.');
  }

  async verifyTrialArrangeentTileContent() {
    await I.see('Finalise your trial arrangements for your upcoming trial','h3');
    await I.see('Due by:');
    await I.see('If there are changes to your trial arrangements, you should let us know by midnight,');
    await I.see('You may wish to review the original directions you supplied in the');
    await I.seeElement('//a[.=\'directions questionnaire\']');
    await I.see('under ‘Notices and orders’ prior to finalising your trial arrangements.');
  }

  async verifyOtherPartyTrialArrangementTileContent() {
    await I.see('The other party has finalised their trial arrangements','h3');
    await I.see('You can view the other party\'s trial arrangements under \'Notices and orders\'.');
  }

  async verifyBundleTileContent() {
    await I.wait(2);
    await I.refreshPage();
    await I.see('Bundle is complete and ready to view','h3');
    await I.see('The bundle contains all the documents submitted by both parties.');
    await I.see('Please review the bundle to makes sure all the information is correct.');
    await I.see('You are reminded that the other party will also be able to view the bundle.');
  }
}

module.exports = LatestUpdate;

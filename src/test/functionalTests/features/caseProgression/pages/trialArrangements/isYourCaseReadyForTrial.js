const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class IsYourCaseReadyForTrial {

  checkPageFullyLoaded () {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyIsThisCaseReadyForTrialSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Finalise your trial arrangements', 'h1');
    //I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
  }

  verifyIsThisCaseReadyForTrialSectionContent() {
    I.see('Is the case ready for trial?','h3');
    I.see('You are reminded that this information will be shared with all other parties');
    I.see('Yes');
    I.see('No');
  }

  inputDataForIsThisCaseReadyForTrialPage() {
    I.see('Is the case ready for trial?','h3');
    I.see('You are reminded that this information will be shared with all other parties');
    I.click('//input[@id=\'option\']');
  }
}

module.exports = IsYourCaseReadyForTrial;

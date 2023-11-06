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

  inputDataForIsThisCaseReadyForTrialPage(readyForTrial) {
    I.see('Is the case ready for trial?','h3');
    I.see('You are reminded that this information will be shared with all other parties');
    I.click('//input[@value=\''+readyForTrial+'\']');
    if (readyForTrial==='no'){
      I.see('You will still need to continue and provide some information on trial arrangements.');
      I.see('You will need to make an application to the court if this case is not ready for the trial.');
      I.see('The trial will go ahead as planned on the specified date unless a judge makes an order changing the date of the trial.');
      I.see('If you want the date of the trial to be changed (or any other order to make the case ready for trial) you will need to make an application to the court.');
    }
  }
}

module.exports = IsYourCaseReadyForTrial;
